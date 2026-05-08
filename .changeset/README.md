# Changesets

Use Changesets to manage versioning and changelogs for publishable packages.

## Create a changeset

```bash
npm run changeset
```

## Bump versions locally

```bash
npm run version-packages
```

## Publish

```bash
npm run release
```

## Release Checklist

1. Make code changes in publishable packages.
2. Create a changeset and select the affected package(s):

```bash
npm run changeset
```

3. Commit code changes and the new file(s) in `.changeset/`.
4. Generate version/changelog updates:

```bash
npm run version-packages
```

5. Commit the version/changelog updates.
6. Publish packages and tags:

```bash
npm run release
```

7. Push commits and tags to remote.

## Bump Type Guide

- patch: Bug fixes, internal refactors, docs/config updates, or packaging/build changes that do not break existing consumers.
- minor: New backward-compatible features, new component props with safe defaults, or new exported components/hooks.
- major: Breaking API changes, removed/renamed exports, changed default behavior that can break consumers, or required migration steps.

When unsure between patch and minor, choose minor.
