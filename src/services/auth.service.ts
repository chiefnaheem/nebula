import { CognitoUserPool } from "amazon-cognito-identity-js";
import { cognitoIdentityServiceProvider } from "../config/aws";
import { AuthRequest, User } from "../types";
import { logger } from "../utils/logger";
import * as dotenv from "dotenv";
dotenv.config();

export class AuthService {
  private userPool: CognitoUserPool;
  private clientId = process.env.COGNITO_CLIENT_ID!;
  private clientSecret = process.env.COGNITO_CLIENT_SECRET!;

  constructor() {
    console.log(
      "Initializing AuthService with User Pool ID:",
      process.env.COGNITO_USER_POOL_ID,
      process.env.COGNITO_CLIENT_ID
    );
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      ClientId: this.clientId,
      // UserPoolId: "eu-north-1_ef3YYrtqE",
      // ClientId: "2dndmhdbnofarg0vp7rusuc3c0",
    });
  }

  private generateSecretHash(username: string): string {
    const crypto = require("crypto");
    return crypto
      .createHmac("sha256", this.clientSecret)
      .update(username + this.clientId)
      .digest("base64");
  }

  async register(
    authRequest: AuthRequest
  ): Promise<{ user: User; tempPassword?: string }> {
    try {
      const { email, password, name, preferred_username } = authRequest;

      const params = {
        ClientId: this.clientId,
        Username: preferred_username || email,
        Password: password,
        SecretHash: this.generateSecretHash(preferred_username!),
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: name || email },
          { Name: "preferred_username", Value: preferred_username },
          { Name: "phone_number", Value: "+2347065074555" },
        ],
      };

      const result = await cognitoIdentityServiceProvider
        .signUp(params)
        .promise();

      logger.info("User registered successfully", { userId: result.UserSub });

      return {
        user: {
          id: result.UserSub!,
          email,
          name: name || email,
          preferred_username: preferred_username || email,
        },
      };
    } catch (error) {
      logger.error("Registration failed", error);
      throw error;
    }
  }

  async login(
    authRequest: AuthRequest
  ): Promise<{ user: User; accessToken: string; idToken: string }> {
    try {
      const { preferred_username, password } = authRequest;

      const params = {
        AuthFlow: "USER_PASSWORD_AUTH" as const,
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: preferred_username!,
          PASSWORD: password,
          SECRET_HASH: this.generateSecretHash(preferred_username!),
        },
      };

      const result = await cognitoIdentityServiceProvider
        .initiateAuth(params)
        .promise();

      if (!result.AuthenticationResult) {
        throw new Error("Authentication failed");
      }

      const { AccessToken, IdToken } = result.AuthenticationResult;

      // Get user attributes
      const userParams = {
        AccessToken: AccessToken!,
      };

      const userResult = await cognitoIdentityServiceProvider
        .getUser(userParams)
        .promise();

      const userAttributes =
        userResult.UserAttributes?.reduce((acc, attr) => {
          acc[attr.Name!] = attr.Value!;
          return acc;
        }, {} as Record<string, string>) || {};

      const user: User = {
        id: userResult.Username,
        email: userAttributes.email,
        name: userAttributes.name,
        preferred_username: userAttributes.preferred_username,
      };

      logger.info("User logged in successfully", { userId: user.id });

      return {
        user,
        accessToken: AccessToken!,
        idToken: IdToken!,
      };
    } catch (error) {
      logger.error("Login failed", error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const params = {
        AccessToken: token,
      };

      const result = await cognitoIdentityServiceProvider
        .getUser(params)
        .promise();

      const userAttributes =
        result.UserAttributes?.reduce((acc, attr) => {
          acc[attr.Name!] = attr.Value!;
          return acc;
        }, {} as Record<string, string>) || {};

      return {
        id: userAttributes.sub!,
        email: userAttributes.email,
        name: userAttributes.name,
        preferred_username: userAttributes.preferred_username,
      };
    } catch (error) {
      logger.error("Token verification failed", error);
      throw error;
    }
  }
}
