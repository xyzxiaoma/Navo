# Component Guidelines

> How components are built in this project.

---

## Overview

<!--
Document your project's component conventions here.

Questions to answer:
- What component patterns do you use?
- How are props defined?
- How do you handle composition?
- What accessibility standards apply?
-->

(To be filled by the team)

---

## Component Structure

<!-- Standard structure of a component file -->

(To be filled by the team)

---

## Props Conventions

<!-- How props should be defined and typed -->

(To be filled by the team)

---

## Styling Patterns

Use entrypoint-scoped CSS files for the current new tab UI. Keep colors behind
semantic CSS variables on `.app-shell` so theme changes do not branch component
markup.

### Convention: Iconify Icons

**What**: UI icons use Iconify's Svelte component with bundled icon data.

**Why**: Browser extension pages should not depend on runtime icon API requests,
and bundled icon data keeps new tab rendering deterministic under extension CSP.

**Example**:

```svelte
<script lang="ts">
  import Icon from '@iconify/svelte';
  import searchIcon from '@iconify-icons/lucide/search';
</script>

<Icon icon={searchIcon} width="18" height="18" aria-hidden="true" />
```

**Do not** hand-draw common UI icons with CSS or inline SVG when an Iconify
icon exists. Symbol-only controls still need an accessible name on the button.

---

## Accessibility

Symbol-only controls need an accessible name through `aria-label` or equivalent
visible text. Decorative icons should set `aria-hidden="true"` so assistive
technology reads the control label, not the icon path.


---

## Common Mistakes

<!-- Component-related mistakes your team has made -->

(To be filled by the team)
