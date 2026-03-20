# Outbound Affiliate Link Binding Design

## Goal

Prove that outbound redirects carrying an `affiliateLinkId` can only redirect to targets actually bound to that affiliate link, even when the request is otherwise correctly signed.

## Scope

This design is limited to the outbound redirect path and its verification:

- `app/api/outbound/route.ts`
- `tests/e2e/tool-detail.spec.ts`

Optional supporting test scope if needed:

- `tests/unit/outbound-signature.test.ts`

This design does not include:

- changes to the outbound signature algorithm unless the new test proves that is necessary
- tracking schema changes
- tool-detail UI changes
- broader outbound refactors
- unrelated security work outside outbound target binding

## Problem

The outbound route already has two important protections:

- signature validation
- allowlisted target validation

That is a strong baseline. The remaining security question is narrower:

- when a request includes `affiliateLinkId`, is the target strictly bound to that link's destinations, or can a correctly signed request still jump to another target associated with the same tool?

The code appears to filter affiliate links by `affiliateLinkId`, but this boundary is not yet clearly proven by targeted automated coverage.

## Recommended Approach

Add a focused request-level test that proves a correctly signed request is still rejected when:

- `affiliateLinkId` is present
- the `target` does not belong to that affiliate link

Use the smallest implementation change necessary only if the new test reveals a real gap.

## Alternatives Considered

### Option 1: Add one focused affiliate-link binding regression test

Pros:

- smallest change surface
- directly proves the desired security property
- keeps the outbound system stable

Cons:

- only closes one outbound security slice

### Option 2: Add a wider matrix of query-tampering outbound tests

Pros:

- broader security coverage

Cons:

- more redundant test surface
- dilutes focus from the highest-value missing proof

### Option 3: Refactor outbound allowlist and signature handling first

Pros:

- potentially cleaner long-term architecture

Cons:

- too broad for the current blocker-clearing strategy
- higher regression risk

## Chosen Design

Adopt Option 1.

We will prove the strict binding behavior at the request level by constructing a signed outbound request with:

- a real tool slug
- a real `affiliateLinkId`
- a valid signature
- a target that should not be allowed for that link

Expected result:

- the route returns a safe `302` redirect back to `/tools`

If the test unexpectedly passes through, we will patch only the allowlist binding logic needed to make the test pass.

## Testing Strategy

Primary verification should live in `tests/e2e/tool-detail.spec.ts` because the behavior being proven is a real route outcome, not just a pure helper result.

The new test should verify:

- a signed outbound request with mismatched `affiliateLinkId` and target is blocked
- existing valid signed redirects still return `307`
- existing tampered-target and non-allowlisted-target protections still remain valid

## Success Criteria

This work is complete when:

- the route rejects a signed request whose `target` is not bound to the provided `affiliateLinkId`
- valid signed outbound redirects still work
- the change stays limited to outbound target binding proof and minimal enforcement
