# RWA Tokenization Platform on Bitcoin

Platform for tokenization of real-world assets (RWA) on Bitcoin, with a focus on social impact.

## Project Description

This repository contains the specification base and development framework for a platform that allows:

- Tokenizing real assets and fractionalizing them.
- Buying and selling fractions on a marketplace with 2-of-3 multisig escrow.
- Integrating a self-custodial wallet with Bitcoin on-chain and Lightning.
- Allocating platform fees to an auditable educational treasury.

The complete design is documented in [specs/](specs), including architecture, API contracts, database schema, and frontend.

## Target Stack

- Backend: Python 3.11+, FastAPI
- Frontend: React 18 + TypeScript + Tailwind CSS
- Database: PostgreSQL + Redis
- Blockchain infra: Bitcoin Core + LND + Taproot Assets
- Infrastructure: Docker + CI/CD on GitHub Actions

## Key Documentation

- [specs/README.md](specs/README.md)
- [specs/architecture.md](specs/architecture.md)
- [specs/database-schema.md](specs/database-schema.md)
- [specs/api-contracts.md](specs/api-contracts.md)
- [specs/frontend-spec.md](specs/frontend-spec.md)

## Contribution Guide

This guide is mandatory to maintain quality, traceability, and a consistent workflow.

### 1. Before you start

1. Review open Issues and the GitHub Projects board.
2. Confirm scope, acceptance criteria, and dependencies before implementing.
3. If the task doesn’t exist, create an Issue first and document objective, context, and expected outcome.

### 2. Fork workflow

1. Fork this repository to your account.
2. Clone your fork locally.
3. Add this repository as the `upstream` remote.
4. Create a working branch from the updated main branch.

Example:

```bash
git clone https://github.com/YOUR-USER/tokenization.git
cd tokenization
git remote add upstream https://github.com/ORGANIZATION/tokenization.git
git fetch upstream
git checkout main
git pull upstream main
git push origin main
git checkout -b feat/short-name
```

### 3. Mandatory synchronization

You must sync your fork:

- Before starting to implement.
- Before opening the Pull Request.

Recommended steps:

```bash
git fetch upstream
git checkout main
git pull upstream main
git push origin main
git checkout your-branch
git rebase main
```

If there are conflicts, resolve them locally and make sure everything works before proceeding.

### 4. Granular commits

Commits must be small, atomic, and clearly messaged.

- One logical change per commit.
- Avoid huge commits with unrelated changes.
- Don’t mix refactor, formatting, and new functionality in the same commit.

Suggested message format:

```text
type(scope): short description
```

Examples:

- `feat(wallet): add lightning invoice endpoint`
- `fix(marketplace): validate escrow expiration`
- `docs(specs): update api error contract`

### 5. Minimum quality before PR

Before creating a Pull Request, you must:

1. Sync with `upstream/main` (see previous section).
2. Run tests and local checks.
3. Ensure you don’t commit secrets (`.env`, keys, tokens, credentials).
4. Update documentation if behavior, API, or architecture changes.
5. Confirm your commits are granular and have a clean history.

### 6. Pull Request

When opening the PR from your fork:

1. Link the corresponding Issue (`Closes #123` when applicable).
2. Clearly explain:
   - The problem it solves.
   - The implemented solution.
   - Risks or trade-offs.
   - Evidence of testing (logs, screenshots, covered cases).
3. Keep the PR focused; avoid unrelated changes.
4. Address review feedback with small, well-justified changes.

### 7. Recommended conventions

- Branch names:
  - `feat/...`
  - `fix/...`
  - `docs/...`
  - `chore/...`
- Prioritize security: never publish seeds, private keys, or secrets.
- Maintain consistency with the specifications in [specs/](specs).

## Collaboration best practices

- Discuss important decisions in Issues for traceability.
- Break down large tasks into small, reviewable subtasks.
- Avoid duplicate work: first check if someone is already working on the same thing.
- If a change alters API contracts, accompany the PR with updated specs.

## Repository status

Currently, the repository is focused on specifications and implementation planning. Application code is developed based on this documentation base.

## License

This project is distributed under the license defined in [LICENSE](LICENSE).
