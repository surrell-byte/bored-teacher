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

Create separate Firebase projects for staging and production. Configure the six `NEXT_PUBLIC_FIREBASE_*` values as deployment secrets in both environments. Configure `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` as a server-only secret for username sign-in and password reset; its service account must belong to the matching Firebase project. Never commit this credential or expose it through a `NEXT_PUBLIC_*` variable. Username authentication reports a configuration error when the secret is missing. The production build fails when any required public Firebase key is missing.

Class rosters, class scores, and class leaderboard queries are restricted to the owning teacher until a server-verified student membership flow is implemented. Do not loosen these rules based only on a client-controlled `classId`.

## Mobile fullscreen games

Game pages use the browser Fullscreen API where available. On browsers that do not allow ordinary web pages to hide browser controls, install the site from the browser's **Add to Home Screen** option and launch the installed app; the web manifest requests fullscreen display. Test both the in-browser control and installed-app launch on iOS Safari and Android browsers over HTTPS.

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
