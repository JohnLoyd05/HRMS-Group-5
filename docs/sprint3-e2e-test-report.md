# Sprint 3 E2E Production Test Report
Date: 2026-05-18
Tester: [Roy Vincent Ojo]
Environment: Production (https://hrms-group-5.vercel.app)

## Test Results

### USER Type (HR Staff)
| Test Case | Expected | Result | Screenshot |
|-----------|----------|--------|------------|
| Login via email | Redirects to /employees | PASS | [screenshots/Email-Login.png] |
| Login via Google | Redirects to /employees | PASS | [screenshots/Google-Login.png] |
| View Employees | Table loads | PASS | [screenshots/View-Employees.png] |
| Add button hidden | Not visible | PASS | [screenshots/Add-Button-Hidden.png] |
| Stamp column hidden | Not visible | PASS | [screenshots/Stamp-Hidden.png] |
| Deleted Items hidden in sidebar | Not visible | PASS | [screenshots/DelItems-Admin-Hidden.png] |
| Admin hidden in sidebar | Not visible | PASS | [screenshots/DelItems-Admin-Hidden.png] |

### ADMIN Type (HR Manager)
| Test Case | Expected | Result | Screenshot |
|-----------|----------|--------|------------|
| Add Employee visible | Button shown | PASS | [screenshots/Add-Edit-Deactivate-Stamp-Visible.png] |
| Edit Employee visible | Button shown | PASS | [screenshots/Add-Edit-Deactivate-Stamp-Visible.png] |
| Deactivate Employee visible | Button shown | PASS | [screenshots/Add-Edit-Deactivate-Stamp-Visible.png] |
| Stamp column visible | Column shown | PASS | [screenshots/Add-Edit-Deactivate-Stamp-Visible.png] |
| Deleted Items visible | Page loads | PASS | [screenshots/Deleted-Items.png] |
| Admin page visible | Page loads | PASS | [screenshots/Admin-Page.png] |
| SUPERADMIN row protected | Shows "Protected" | PASS | [screenshots/SuperAdmin-Protected.png] |

### SUPERADMIN Type
| Test Case | Expected | Result | Screenshot |
|-----------|----------|--------|------------|
| All ADMIN features work | All pass | PASS | [screenshots/All-Admin-Feats-Work.png] |
| Sees INACTIVE rows | Rows visible | PASS | [screenshots/Inactive-Rows.png] |

### SUPERADMIN Protection
| Test Case | Expected | Result | Screenshot |
|-----------|----------|--------|------------|
| ADMIN cannot click SUPERADMIN row | Buttons disabled | PASS | [screenshots/SuperAdmin-Protected.png] |

### Cascade Soft Delete (Production)
| Test Case | Expected | Result | Screenshot |
|-----------|----------|--------|------------|
| Deactivate emp 00001 | Job history hidden for USER | PASS | [screenshots/JH-Hidden.png] |
| Job history in Deleted Items | Visible for ADMIN | PASS | [screenshots/JH-Admin-Visible.png] |
| Recover emp 00001 | Job history reappears for USER | PASS | [screenshots/JH-Reappears-User.png] |

## Summary
All X/X test cases passed.