import sys
import json
import os
from typing import Any

# deepeval imports
try:
    from deepeval.metrics import ExactMatchMetric, PatternMatchMetric
    from deepeval.evaluate import assert_test
    from deepeval.models import LLMTestCase
except Exception as e:
    print(json.dumps({'success': False, 'error': f'deepeval import error: {e}'}))
    sys.exit(1)


def load_payload(arg: str) -> Any:
    # If arg is a path to a file, load it; otherwise parse as JSON string
    if os.path.exists(arg):
        with open(arg, 'r', encoding='utf-8-sig') as f:
            return json.load(f)
    try:
        return json.loads(arg)
    except Exception:
        return None


def main():
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'missing payload arg (file or json)'}))
        sys.exit(2)

    payload = load_payload(sys.argv[1])
    if not payload:
        print(json.dumps({'success': False, 'error': 'invalid payload'}))
        sys.exit(2)

    # Expected payload keys: input, actual, expected (or pattern), context (optional), model (optional)
    inp = payload.get('input', '')
    actual = payload.get('actual', '')
    expected = payload.get('expected')
    pattern = payload.get('pattern')
    context = payload.get('context', '')

    test_case = LLMTestCase(
        input=inp,
        actual_output=str(actual),
        expected_output=str(expected) if expected is not None else None,
        context=context,
    )

    if pattern:
        metric = PatternMatchMetric(pattern=pattern)
    else:
        metric = ExactMatchMetric()

    # model selection: default to 'gemini' unless overridden
    model_to_use = payload.get('model', 'gemini')
    os.environ['DEEPEVAL_MODEL'] = model_to_use

    try:
        assert_test(test_case=test_case, metrics=[metric], run_async=False)
        print(json.dumps({'success': True, 'metric': metric.__class__.__name__, 'model': model_to_use}))
        sys.exit(0)
    except AssertionError as exc:
        print(json.dumps({'success': False, 'error': str(exc), 'model': model_to_use}))
        sys.exit(1)


if __name__ == '__main__':
    main()
