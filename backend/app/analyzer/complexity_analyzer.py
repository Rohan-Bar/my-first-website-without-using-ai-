import re


def analyze_complexity(code: str):
    """
    Estimate time and space complexity using simple loop analysis.

    Rules:
        No loops        -> O(1)
        One loop        -> O(n)
        Nested 2 loops  -> O(n²)
        Nested 3+ loops -> O(n³)

    Also reports the approximate lines containing
    the deepest loop nesting.
    """

    lines = code.splitlines()

    max_nesting = 0
    bottleneck_lines = []

    # Stack containing indentation levels of active loops.
    loop_stack = []

    for line_number, line in enumerate(lines, start=1):

        stripped = line.strip()

        # Ignore empty lines
        if not stripped:
            continue

        indentation = len(line) - len(line.lstrip())

        # Remove loops that are no longer active.
        while loop_stack and indentation <= loop_stack[-1][0]:
            loop_stack.pop()

        # Detect Python-style for/while loops.
        is_loop = bool(
            re.match(
                r"^(for|while)\b",
                stripped
            )
        )

        if is_loop:

            loop_stack.append(
                (indentation, line_number)
            )

            current_nesting = len(loop_stack)

            if current_nesting > max_nesting:

                max_nesting = current_nesting

                bottleneck_lines = [
                    item[1]
                    for item in loop_stack
                ]

    # =====================================================
    # TIME COMPLEXITY
    # =====================================================

    if max_nesting == 0:

        time_complexity = "O(1)"

    elif max_nesting == 1:

        time_complexity = "O(n)"

    elif max_nesting == 2:

        time_complexity = "O(n²)"

    else:

        time_complexity = "O(n³)"


    # =====================================================
    # BOTTLENECK LINES
    # =====================================================

    if bottleneck_lines:

        bottleneck_lines_text = ", ".join(
            map(str, bottleneck_lines)
        )

    else:

        bottleneck_lines_text = ""


    # =====================================================
    # SPACE COMPLEXITY
    # =====================================================

    # This is a simplified estimate.
    # A complete space-complexity analyzer would need
    # deeper AST/data-flow analysis.

    space_complexity = "O(1)"


    return {
        "time": time_complexity,
        "space": space_complexity,
        "bottleneck_lines": bottleneck_lines_text,
    }