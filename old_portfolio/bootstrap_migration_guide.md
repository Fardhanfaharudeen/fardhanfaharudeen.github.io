# Bootstrap 3 to 5 Migration Guide for CBI UAE Website

This document outlines the necessary HTML structure changes required after upgrading the Bootstrap JavaScript version from **3.3.7** to **5.0**.

## 1. Data Attribute Updates (CRITICAL)
Bootstrap 5.0 requires the `bs` infix for all data attributes used by JavaScript plugins (Modals, Dropdowns, Tooltips, etc.). Without these changes, interactive elements will not function.

| Bootstrap 3/4 Attribute | Bootstrap 5 Attribute | Usage |
| :--- | :--- | :--- |
| `data-toggle` | `data-bs-toggle` | Dropdowns, Modals, Collapses, Tabs |
| `data-target` | `data-bs-target` | Modals, Collapses, Carousels |
| `data-dismiss` | `data-bs-dismiss` | Modals, Alerts |
| `data-ride` | `data-bs-ride` | Carousels |
| `data-slide` | `data-bs-slide` | Carousels |
| `data-slide-to` | `data-bs-slide-to` | Carousels |

## 2. Grid System Changes
Bootstrap 5 has removed the `xs` infix and changed how offsets work.

| Old Class (BS3) | New Class (BS5) | Notes |
| :--- | :--- | :--- |
| `col-xs-*` | `col-*` | e.g., `col-xs-6` becomes `col-6` |
| `col-sm-*` | `col-sm-*` | Remains same |
| `col-md-*` | `col-md-*` | Remains same |
| `col-lg-*` | `col-lg-*` | Remains same |
| `col-md-offset-*` | `offset-md-*` | e.g., `col-md-offset-3` becomes `offset-md-3` |

## 3. Responsive Utilities
Bootstrap 3 visibility classes like `hidden-xs` have been removed in favor of `display` utilities.

| Old Class (BS3) | New Class (BS5) | Description |
| :--- | :--- | :--- |
| `hidden-xs` | `d-none d-sm-block` | Hidden on extra small, shown on small and up |
| `hidden-sm` | `d-sm-none d-md-block` | Hidden on small, shown on medium and up |
| `visible-xs` | `d-block d-sm-none` | Shown only on extra small |
| `visible-sm` | `d-none d-sm-block d-md-none` | Shown only on small |
| `img-responsive` | `img-fluid` | Makes images responsive |

## 4. Alignment & Layout
Text and float utilities have changed from `left`/`right` to `start`/`end` to support Right-to-Left (RTL) languages better.

| Old Class (BS3) | New Class (BS5) | Notes |
| :--- | :--- | :--- |
| `text-left` | `text-start` | |
| `text-right` | `text-end` | |
| `pull-left` | `float-start` | |
| `pull-right` | `float-end` | |
| `center-block` | `mx-auto d-block` | |

## 5. Navbar Specifics
Bootstrap 5 Navbars have significant structural changes.
- `navbar-toggle` is now `navbar-toggler`.
- The burger icon inside `navbar-toggler` should use the class `navbar-toggler-icon`.
- `navbar-right` is replaced by `ms-auto` (margin-start: auto).

## 6. Components Detected on CBI Website
- **Dropdowns**: Ensure `data-bs-toggle="dropdown"` is used on the button/link.
- **Carousel**: Update `data-bs-ride="carousel"`, `data-bs-slide`, and `data-bs-slide-to`.
- **Modals**: Update `data-bs-toggle="modal"` and `data-bs-target="#id"`.

---
*Note: This list is based on a crawl of https://www.cbiuae.com/en/Personal.*
