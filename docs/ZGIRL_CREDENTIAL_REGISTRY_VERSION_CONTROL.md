# Z-Girl Credential Registry & Version-Control Standard

Version: 1.0

## Purpose

Define the minimum administrative system required to know who is authorized, for what role, under which version, for which institutional/profile scope, and until what date.

## Registry principles

- collect only credential-administration data needed to manage authorization;
- never use the registry as a repository for participant private reflections;
- make status verifiable without exposing unnecessary personal information;
- tie active authorization to current governed content/assessment versions;
- preserve a history of status changes and decisions;
- support suspension/revocation quickly when needed.

## Minimum internal credential record

Required fields:
- credential ID;
- holder full name;
- preferred/public display name if different;
- contact email;
- authorization tier;
- status;
- issue date;
- expiration date;
- institution/network scope;
- approved profile scope;
- training curriculum version;
- knowledge-assessment version/result;
- practicum rubric version/result;
- last renewal date;
- next renewal due date;
- conditions/restrictions, if any;
- remediation status, if any;
- trainer license dependency for Level 3;
- administrative notes limited to credential management;
- status-change history.

## Public verification record

If public verification is enabled, expose only fields appropriate for verification, such as:
- credential ID;
- display name;
- authorization title;
- active/inactive status;
- issue/expiration dates;
- approved profile or institutional scope where appropriate;
- verification timestamp.

Do not expose:
- private contact information;
- assessment answer details;
- remediation narrative;
- employment HR data;
- background-check information;
- participant data or private reflections;
- safeguarding case information.

## Version model

Each governed asset should have a version identifier and effective date.

Controlled assets include:
- facilitator competency framework;
- training curriculum;
- knowledge assessment;
- practicum rubric;
- authorization policy;
- privacy/safety boundaries;
- profile-specific facilitator guidance;
- trainer curriculum;
- trainer calibration cases;
- renewal standard;
- credential mark/record template.

## Version states

- Draft
- Review
- Approved
- Active
- Superseded
- Retired

Only Active versions may be used for new authorization unless the credential authority documents an approved transition rule.

## Change classification

### Minor
Examples:
- typo correction;
- non-substantive formatting;
- clarification that does not change scoring or safety/privacy meaning.

Action:
- version patch/update;
- no automatic reassessment unless specified.

### Material
Examples:
- new critical assessment item;
- changed privacy/safeguarding standard;
- new authorization tier;
- changed pass threshold;
- changed role boundary;
- substantive profile requirement.

Action:
- new effective version;
- transition plan;
- targeted or full reauthorization requirement as determined.

### Critical
Examples:
- discovered unsafe guidance;
- material legal/safety/privacy defect;
- assessment content that could permit prohibited behavior.

Action:
- immediately retire affected version where appropriate;
- issue update notice;
- require defined corrective training/reassessment;
- identify impacted active credentials;
- document remediation.

## Candidate evidence integrity

Assessment records should include:
- candidate;
- date;
- assessment version;
- score;
- critical-item pass/fail;
- proctor/trainer if applicable;
- attempt number;
- remediation/retest status.

Practicum records should include:
- candidate;
- observer;
- date;
- rubric version;
- score;
- critical-fail status;
- decision;
- assigned remediation where applicable.

## Status-change audit trail

Record:
- previous status;
- new status;
- effective date/time;
- reason category;
- authorized reviewer;
- linked decision/remediation record.

Do not overwrite history when a status changes.

## Credential badge / verification language

Recommended active credential display:

**Z-Girl Authorized Facilitator**  
Credential ID: [ID]  
Active through: [DATE]  
Scope: [PROFILE / INSTITUTION IF APPLICABLE]

Footer/disclaimer:

> Z-Girl authorization is a program credential confirming current Z-Girl facilitation standards within the stated scope. It is not professional licensure, academic accreditation, or clinical certification.

## Expiration automation readiness

Future credential platform should support:
- 60/30/7-day renewal reminders;
- automatic Expiring status;
- automatic Lapsed status at expiration unless extended;
- institution administrator notification;
- suspension/revocation status propagation to public verification;
- version-update assignments;
- audit logs.

## Access roles for future platform

### Credential Authority Admin
Can issue/change status, approve tiers, manage versions.

### Trainer
Can view assigned candidates, submit evidence, recommend decisions within licensed scope; cannot unilaterally override governed critical standards.

### Institutional Admin
Can view staff authorization status needed for deployment; cannot view answer keys, unnecessary remediation detail, or participant private reflections.

### Credential Holder
Can view own status, term, scope, required renewal items, and approved verification record.

### Public
Can verify only approved limited fields if public verification is enabled.

## Retention

Retention periods for credential-administration records should be set through applicable business/legal/privacy review. Retain no more information than necessary for credential integrity, contractual obligations, dispute handling, and lawful requirements.

## Security

Future registry implementation should include:
- authenticated role-based access;
- least privilege;
- audit logging;
- secure storage/transmission;
- recovery/backups appropriate to system criticality;
- secret-safe configuration;
- no credential secrets in public source code.
