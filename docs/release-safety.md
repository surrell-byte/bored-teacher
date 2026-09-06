# Release safety

This project should have three environments:

- Development: local `.env.local` and test accounts.
- Staging: a separate Firebase project and deployment for release testing.
- Production: the customer-facing Firebase project and deployment.

Never point local development or staging at the production Firestore database.

## Required release gates

Run this before publishing:

```bash
npm run build
```

The build runs environment validation, catalog validation, automated tests, TypeScript validation, and the production Next.js build.

For a manual smoke test, verify:

- Register a new account.
- Sign in with email and username.
- Sign out and sign back in.
- Request a password reset.
- Open a game and confirm progress is saved.
- Edit a signed-in profile.
- Confirm a guest cannot edit a profile.
- Confirm a non-creator cannot access `/admin`.
- Confirm premium access is not granted until payment is verified.

## Firebase setup

Create separate Firebase projects for staging and production. Configure the six `NEXT_PUBLIC_FIREBASE_*` values as deployment secrets in both environments. The production build fails when any required key is missing.

Deploy Firestore rules deliberately:

```bash
firebase use <staging-project>
firebase deploy --only firestore:rules
```

Test staging first. Only then switch to the production project and deploy the same reviewed rules.

## Subscription safety

The browser must never set `teacherPro`. A verified payment webhook or trusted server process must update that field. Do not restore browser-local premium flags. Keep payment provider event IDs and subscription status in a server-controlled record so duplicate or delayed webhooks are safe.

## Backward-compatible changes

Prefer additive Firestore fields. Read old and new shapes during migrations. Do not delete or rename subscription fields in the same release that introduces their replacement. Back up production data before migrations.

## Rollback

Keep the previous deployment available. If a release causes login, payment, or data errors:

1. Stop promoting the release.
2. Roll back the hosting deployment to the previous known-good build.
3. Do not roll back Firestore rules or data blindly; rules and schema may already be in use.
4. Inspect Firebase Authentication, Firestore, hosting, and payment logs.
5. Reproduce the failure in staging, fix it, and rerun the release gates.

## GitHub Actions

`.github/workflows/ci.yml` runs the same build gates for pushes and pull requests. Add the Firebase public configuration values as GitHub Actions secrets before enabling protected merges.
