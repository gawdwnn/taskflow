import { z } from "zod";

// Represents validation errors for each field in an input object
// T is the type of the input object, and each key can have an array of error messages
export type FieldErrors<T> = {
  [K in keyof T]?: string[];
};

// Defines the structure of an action's state, including errors and output data
// TInput: Type of the input data
// TOutput: Type of the processed output data
export type ActionState<TInput, TOutput> = {
  fieldErrors?: FieldErrors<TInput>;  // Validation errors for specific fields
  error?: string | null;              // General error message
  data?: TOutput;                     // Processed output data
};

// Higher-order function to create a type-safe, validated action
// This function encapsulates input validation and error handling logic
export const createSafeAction = <TInput, TOutput>(
  schema: z.Schema<TInput>,  // Zod schema for input validation
  handler: (validatedData: TInput) => Promise<ActionState<TInput, TOutput>>  // Action logic
) => {
  // Returns an async function that validates input and executes the handler
  return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
    // Validate input data against the provided schema
    const validationResult = schema.safeParse(data);

    // If validation fails, return field-specific errors
    if (!validationResult.success) {
      return {
        fieldErrors: validationResult.error.flatten().fieldErrors as FieldErrors<TInput>,
      };
    }

    // If validation succeeds, execute the handler with validated data
    return handler(validationResult.data);
  };
};