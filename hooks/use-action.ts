import { useState, useCallback } from "react";
import { ActionState, FieldErrors } from "@/lib/create-safe-action";

// Define the shape of the action function
type Action<TInput, TOutput> = (
  data: TInput
) => Promise<ActionState<TInput, TOutput>>;

// Options for customizing the behavior of useAction
interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

// Custom hook for managing asynchronous actions with error handling and loading states
export const useAction = <TInput, TOutput>(
  action: Action<TInput, TOutput>,
  options: UseActionOptions<TOutput> = {}
) => {
  // State for field-specific errors
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<TInput> | undefined
  >(undefined);
  // State for general error message
  const [error, setError] = useState<string | undefined>(undefined);
  // State for successful action result
  const [data, setData] = useState<TOutput | undefined>(undefined);
  // State for tracking if the action is in progress
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to execute the action and manage related states
  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);

      try {
        const result = await action(input);

        if (!result) {
          return;
        }

        // Update field errors if any
        setFieldErrors(result.fieldErrors);

        // Handle general error
        if (result.error) {
          setError(result.error);
          options.onError?.(result.error);
        }

        // Handle successful result
        if (result.data) {
          setData(result.data);
          options.onSuccess?.(result.data);
        }
      } finally {
        // Ensure loading state is reset and onComplete is called
        setIsLoading(false);
        options.onComplete?.();
      }
    },
    [action, options]
  );

  // Return all necessary states and the execute function
  return {
    execute,
    fieldErrors,
    error,
    data,
    isLoading,
  };
};
