import Joi from "joi";

export const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().optional(),
  preferred_username: Joi.string().optional(),
});

export const scoreSchema = Joi.object({
  score: Joi.number().integer().min(0).required(),
});

export const validateRequest = <T>(schema: Joi.ObjectSchema, data: any): T => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(
      `Validation error: ${error.details.map((d) => d.message).join(", ")}`
    );
  }
  return value;
};
