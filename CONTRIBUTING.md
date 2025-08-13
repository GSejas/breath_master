# Contributing to Breath Master

Thank you for your interest in contributing to Breath Master! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs
- Use the GitHub Issues tab
- Include VS Code version, operating system, and extension version
- Provide clear steps to reproduce the issue
- Include screenshots or GIFs if applicable

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Consider how it aligns with our privacy-first principles

### Code Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit with descriptive messages
7. Push to your fork and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/breath_master.git
cd breath_master

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test

# Package extension
npm run package
```

## Code Style
- Use TypeScript strict mode
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Write unit tests for new features

## Privacy Principles
All contributions must maintain our privacy-first approach:
- No data collection or telemetry
- Local-only storage
- Transparent functionality
- User control over all features

## Questions?
Feel free to open an issue for any questions about contributing!
