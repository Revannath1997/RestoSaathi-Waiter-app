# Contributing to RestoSaathi Waiter App

Thank you for your interest in contributing to the RestoSaathi Waiter App! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report inappropriate behavior

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check the issue list as you might find out that you don't need to create one. When you do create a bug report, please include as many details as possible:

- **Use a clear, descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear, descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Follow the JavaScript style guide
- Include appropriate test cases
- Update documentation as needed
- End all files with a newline
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")

## Development Setup

1. **Fork the repository**
   ```bash
   # Visit https://github.com/yourusername/resto-saathi
   # Click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/resto-saathi.git
   cd resto-saathi
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original/resto-saathi.git
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Setup development environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   npm install
   npm run prisma:generate
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   npm install
   ```

## Commit Messages

Follow these conventions for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, missing semicolons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests
- **chore**: Changes to build process, dependencies, or tools

### Scope
The scope should specify what is being changed (e.g., auth, orders, menu, etc)

### Subject
- Use imperative, present tense
- Don't capitalize first letter
- No period (.) at the end
- Limit to 50 characters

### Examples

```
feat(auth): add JWT token refresh mechanism

fix(orders): prevent duplicate order creation

docs(readme): update installation instructions

style(frontend): format React component files
```

## JavaScript/Node.js Style Guide

### Naming Conventions

```javascript
// Functions and variables: camelCase
const getUserData = () => {}
let isLoading = false

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const API_TIMEOUT = 5000

// Classes and Components: PascalCase
class UserService {}
function OrderItem() {}

// Private functions: _prefix
const _internalHelper = () => {}
```

### Code Style

- Use `const` by default, `let` if you need to reassign
- Use arrow functions
- Use template literals instead of string concatenation
- No var - use const/let
- 2-space indentation
- Single quotes for strings (except JSX)
- Always use semicolons
- No trailing commas (except in multiline arrays/objects)

### Examples

```javascript
// ✅ Good
const getUserById = async (id) => {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return user;
};

const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
var get_user_by_id = function(id) {
  let user = db.query("SELECT * FROM users WHERE id = " + id);
  return user;
}
```

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage
- Use meaningful test descriptions

```javascript
describe('OrderService', () => {
  it('should create a new order with items', async () => {
    const order = await OrderService.create({...});
    expect(order).toBeDefined();
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add JSDoc comments for functions
- Include usage examples

```javascript
/**
 * Creates a new order in the system
 * @param {Object} orderData - The order details
 * @param {string} orderData.restaurantId - Restaurant ID
 * @param {string} orderData.tableId - Table ID
 * @param {Array} orderData.items - Array of order items
 * @returns {Promise<Object>} Created order object
 * @throws {Error} If order creation fails
 */
const createOrder = async (orderData) => {
  // implementation
};
```

## Review Process

1. **Automated Checks**
   - Code style linting
   - Test suite execution
   - Build verification

2. **Code Review**
   - Maintainers will review your PR
   - Provide feedback and suggestions
   - Request changes if needed

3. **Approval & Merge**
   - Once approved, your PR will be merged
   - Your contribution will be credited

## Community

- **Discussions**: GitHub Discussions for feature ideas
- **Issues**: GitHub Issues for bugs and feature requests
- **Slack**: Join our Slack community (link in README)
- **Email**: contact@restosaathi.com for direct inquiries

## License

By contributing to RestoSaathi Waiter App, you agree that your contributions will be licensed under its MIT License.

---

Thank you for contributing to RestoSaathi! 🎉
