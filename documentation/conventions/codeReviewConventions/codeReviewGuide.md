# Code Review Guide

This document outlines the guidelines and best practices for conducting code reviews to ensure high quality and maintainability of our codebase.

## 1 Purpose of Code Review
- **Improve Quality**: Identify bugs and errors before they make it to production.
- **Knowledge Sharing**: Facilitate knowledge transfer among team members regarding the codebase and features.
- **Code Consistency**: Ensure the code adheres to the style guide and project conventions.
- **Mentoring**: Provide growth opportunities through feedback on coding practices and design decisions.

## 2 Preparing for Code Review
- **Understand the Context**: Familiarize yourself with the relevant parts of the codebase and the specifics of the change request.
- **Review Scope**: Ensure the review is manageable; ideally, changesets should not exceed 400 lines of code.
- **Automated Tests**: Confirm that the submitted code includes necessary unit or integration tests and that all tests pass.

## 3 Conducting the Review
- **Clarity**: Check if the code is clear and understandable. If not, request clarifications or comments.
- **Architecture and Design**: Evaluate if the code is well-designed and appropriately abstracted.
- **Efficiency**: Analyse the code for performance issues or inefficiencies.
- **Testing**: Assess the thoroughness of the test cases and their coverage.

## 4 Giving Feedback
- **Constructive Criticism**: Phrase feedback positively and constructively, focusing on the code and not the individual.
- **Specific and Actionable**: Provide specific comments and actionable suggestions.
- **Ask Questions**: Frame inquiries that prompt clarification or rationale, which can provide insight and foster learning.
- **Praise Good Practices**: Acknowledge and commend good coding practices and solutions.

## 5 Handling Feedback
- **Receptivity**: Be open to feedback and ready to discuss and possibly incorporate changes.
- **Clarifications**: Respond to comments with clarifications or adjustments as necessary.
- **Resolving Discussions**: Aim to resolve discussions through consensus. If disagreements persist, involve a third party or a team lead.

## 6 Finalising the Review
- **Approval**: Approve changes only when all critical issues are resolved.
- **Follow-up**: Ensure that any follow-up actions or future considerations are recorded and addressed.
- **Merge**: Once approved, merge the changes in a timely manner to avoid conflicts with other changes in the pipeline.


