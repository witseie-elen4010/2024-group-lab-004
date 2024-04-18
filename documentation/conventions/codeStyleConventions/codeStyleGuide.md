# Code Style Guide

This guide is intended to help maintain consistency and readability across our codebase. It is based on the [Prettier code formatter](https://prettier.io/) settings for Visual Studio Code.

## 1 Formatting

- **Newlines**: Use CRLF (`\r\n`) style for newlines.
- **Trailing Whitespace**: No trailing whitespace at the end of lines.
- **Semicolons**: Do not use semicolons to terminate statements.
- **Line Length**: Maximum of 80 characters per line.
- **Quotes**: Use single quotes for JavaScript, but double quotes are acceptable when dealing with JSON due to Prettier settings.
- **Braces**:
  - Opening braces do not go on their own line; place them at the end of the preceding line.
  - Ensure there is spacing inside braces, e.g., `{ key: value }`.
- **Variables**:
  - Declare one variable per statement.
  - Use `const` for constants, `let` for variables that will change.
- **Tabs and Indentation**: Use a tab width of 2 spaces for indentation.

## 2 Naming Conventions

- **Variables and Functions**: Use `lowerCamelCase` for naming.
- **Classes**: Use `UpperCamelCase` for class names.
- **Constants**: Define constants in `UPPERCASE`.
- **Properties**: If object keys are quoted, maintain consistency across the project as per Prettier’s `quoteProps: 'consistent'`.

## 3 Functions

- **Parameters**: Always use parentheses around arrow function parameters.
- **Returning Values**: Return early from functions to avoid deep nesting of conditions.

## 4 Conditionals

- **Equality**: Use the `===` operator for comparison to avoid type coercion.
- **Simple Equality**: Use the ternary operator for concise conditional statements.

## 5 Comments

- **Style**: Use `//` for both single line and block comments.
- **Purpose**: Focus comments on explaining why something is done, not what is done, unless it is not immediately obvious.

## 6 Arrays and Objects

- **Trailing Commas**: Use trailing commas where possible for better version control compatibility.
- **Destructuring**: Prefer destructuring objects and arrays for readability.

## 7 Version Control

- **Commits**: Write clear, concise commit messages describing the changes made and the reason for them.
- **Branches**: `<story_type>_<issueNumber>/<description>`
