import { isNonEmptyString } from '@sniptt/guards';
// vendor patch: expr-eval-fork@3 ships no type declarations
type EvaluationContext = Parameters<
  ReturnType<typeof conditionalAvailabilityParser.parse>['evaluate']
>[0];

import { conditionalAvailabilityParser } from './conditionalAvailabilityParser';

export const evaluateConditionalAvailabilityExpression = (
  expression: string | null | undefined,
  context: EvaluationContext,
): boolean => {
  if (!isNonEmptyString(expression)) {
    return true;
  }

  try {
    const parsed = conditionalAvailabilityParser.parse(expression);

    return parsed.evaluate(context) === true;
  } catch {
    return false;
  }
};
