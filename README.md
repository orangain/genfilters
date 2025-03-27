# GenFilters

GenFilters is a Deno command-line tool that generates YAML files based on
directory patterns and templates.

[![Built with Deno](https://img.shields.io/badge/built%20with-deno-brightgreen.svg)](https://deno.land/)
[![CI](https://github.com/username/genfilters/actions/workflows/ci.yml/badge.svg)](https://github.com/username/genfilters/actions/workflows/ci.yml)

## Features

- Match directories using glob patterns
- Optionally match only directories containing specific files
- Apply templates with variable substitution
- Output results to specified files

## Installation

### Run Directly

You can run the script directly with Deno:

```bash
deno run --allow-read --allow-write https://github.com/orangain/genfilters/raw/refs/heads/main/mod.ts [config-file]
```

### Install Globally

You can install the tool globally using Deno:

```bash
deno install --allow-read --allow-write -n genfilters https://github.com/orangain/genfilters/raw/refs/heads/main/mod.ts
```

Then use it from anywhere:

```bash
genfilters [config-file]
```

### Local Development

Clone the repository and run:

```bash
# Run directly
deno run --allow-read --allow-write mod.ts [config-file]

# Or make executable
chmod +x mod.ts
./mod.ts [config-file]
```

## Usage

Create a configuration file (default: `genfilters.yaml`) with your filter
definitions, then run:

```bash
# Using default config file (genfilters.yaml)
deno run --allow-read --allow-write mod.ts

# Using a custom config file
deno run --allow-read --allow-write mod.ts custom-config.yaml
```

## Configuration Format

The configuration file should contain an array of filter definitions in YAML
format:

```yaml
- output: path/to/output.yaml
  directory: "glob/pattern/**"
  match-if-exists: optional-file-to-check.txt
  template: |
    {dirname}:
      - {dir}/**
      - other/path/to/include.yml

- output: another/output.yaml
  directory: "another/pattern/*"
  template: |
    {dir}:
      - {dir}/**
```

### Configuration Options

- `output`: Path where the generated YAML will be written
- `directory`: Glob pattern to match directories
- `match-if-exists` (optional): Only match directories containing this file
- `template`: Template string to apply for each matching directory

### Template Variables

- `{dir}`: Relative path to the matched directory
- `{dirname}`: Base name of the matched directory (just the directory name
  itself)

## Example

Given this configuration:

```yaml
- output: .github/filters/test_kotlin.yaml
  directory: "**"
  match-if-exists: Makefile
  template: |
    {dir}:
      - {dir}/**
      - .github/workflows/test_kotlin.yml

- output: .github/filters/deploy.yaml
  directory: "services/*"
  template: |
    {dirname}:
      - {dir}/**
      - .github/workflows/deploy.yml
```

And this directory structure:

```
project/
├── services/
│   ├── api/
│   │   └── Makefile
│   └── web/
├── tools/
│   └── Makefile
└── Makefile
```

The command will generate:

1. `.github/filters/test_kotlin.yaml`:

```yaml
project:
  - project/**
  - .github/workflows/test_kotlin.yml
services/api:
  - services/api/**
  - .github/workflows/test_kotlin.yml
tools:
  - tools/**
  - .github/workflows/test_kotlin.yml
```

2. `.github/filters/deploy.yaml`:

```yaml
api:
  - services/api/**
  - .github/workflows/deploy.yml
web:
  - services/web/**
  - .github/workflows/deploy.yml
```

## Testing

The project includes tests to verify functionality. Run the tests with:

```bash
# Run all tests
deno test --allow-read --allow-write --allow-run

# Run only unit tests
deno test --allow-read --allow-write test/unit_test.ts

# Run only integration tests
deno test --allow-read --allow-write --allow-run test/mod_test.ts
```

### Test Structure

- `test/fixtures/`: Contains test directory structure and files
- `test/mod_test.ts`: Integration tests for the command
- `test/unit_test.ts`: Unit tests for individual functions
- `test/output/`: Generated during tests (cleaned up automatically)

### Continuous Integration

This project uses GitHub Actions for continuous integration. Two workflows are
provided:

#### CI Workflow (`.github/workflows/ci.yml`)

A more comprehensive workflow that:

1. Tests on multiple operating systems (Ubuntu, macOS, Windows)
2. Tests with multiple Deno versions (v1 and v2)
3. Caches dependencies for faster builds

## License

MIT
