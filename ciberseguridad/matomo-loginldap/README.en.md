# Matomo LoginLdap: LDAP attributes and superuser access

[Español](README.md)

## Summary

I tested how a LoginLdap configuration could synchronize Matomo superuser access from an LDAP attribute. In a local lab, an ACL that allowed a user to write their own attribute made it possible to change the value used for that decision. After signing in again, I observed `superuser_access` change from `0` to `1`.

The result depends on that permissive ACL and the synchronization configuration. In a control using the default ACL tested in my environment, LDAP rejected the modification. I did not test production systems or demonstrate a bypass of a correct ACL.

**Evidence status:** this article records my reported results and my summary of Matomo's response. The original test logs and response are not included here and could not be independently checked while preparing this publication. Details absent from those records are not presented as established facts.

## Environment and scope

| Component | Reported version or setting |
| --- | --- |
| Matomo | 5.14.2 |
| LoginLdap | 5.2.9 |
| Directory | OpenLDAP in a disposable local environment |
| Access synchronization | `enable_synchronize_access_from_ldap` enabled |
| Superuser attribute | `ldap_superuser_access_field` set to `employeeType` |

The test was limited to that environment and the access rules I used. I cannot extrapolate the result to other installations, directories, configurations or versions.

## Trust model

LDAP can hold attributes for an account. An ACL—access control list—determines who can read or modify them. In the tested configuration, LoginLdap used `employeeType` as input when synchronizing superuser access in Matomo.

Protecting that input therefore depends on directory write permissions. If an account can modify the attribute the application consults to assign its privileges, it can change data the application trusts. In my lab, I introduced that condition with a permissive ACL; I do not assume it exists elsewhere.

## Test and control

1. I configured synchronization and the attribute described above.
2. With the lab ACL permitting self-write, the user changed their `employeeType` to `1`.
3. After a new login, I observed `superuser_access` change from `0` to `1`.
4. In a separate control using the default ACL tested in the lab, LDAP rejected the modification with `Insufficient access (50)`.

| Condition | Reported result | Limited interpretation |
| --- | --- | --- |
| Lab ACL permitting self-write | Attribute change accepted; after login, `superuser_access` changed from `0` to `1` | The tested configuration trusted an attribute the user could modify. |
| Tested default ACL | Modification rejected: `Insufficient access (50)` | The tested rule prevented that change; this does not establish the behavior of all default ACLs. |

I have not included commands, exact ACL rules, screenshots or database output because I could not retrieve the original records. Reconstructing them from memory as evidence would be misleading.

## Matomo's response

I reported the case to Matomo. According to the response I received, LoginLdap uses LDAP as the authoritative source of roles, and the directory ACL is the trust boundary. Matomo closed the report as **Informative** and ineligible for a reward. It also acknowledged that the documentation could warn more clearly about this dependency.

This is a summary of the response, not a verbatim quotation. The original communication is not included here.

## Versions and secondary observation

I inspected LoginLdap 6.0.6 code, but did not perform an end-to-end test on that version. I therefore do not claim that the lab result reproduces there.

I also noted a reference to empty-value handling: the docblock describes it as intentional. I did not establish that behavior end to end and do not present it as a confirmed finding.

## Reviewing an integration

When assessing an installation, identify the attribute used to assign privileges and review who can modify it under the directory's effective ACLs. The local test shows why those two settings need to be considered together; it does not replace a review of a particular environment.

The conclusion is limited: this is a configuration-dependent risk and a possible documentation gap. Matomo classified the report as informative. It is not a demonstration of a general vulnerability in every installation.
