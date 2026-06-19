# Add New Tab Layout Design

## Scope

This task owns the visual shell and component boundaries for the Navo new tab experience. It intentionally stops before browser bookmark API integration.

## UI Structure

The new tab app is composed as:

```text
App
|-- header.app-header
|   |-- brand
|   |-- search input
|   `-- theme segmented control
`-- div.workspace
    |-- aside.sidebar
    |   |-- sidebar header
    |   `-- mock folder rows
    `-- main.content
        |-- breadcrumb
        |-- content header
        |-- card grid
        `-- state previews
```

The markup can stay in `App.svelte` for this shell task. Later child tasks should extract components once real data and event contracts exist.

## Theme Contract

Use `data-theme` on the root shell with values:

- `light`
- `dark`
- `system`

CSS variables define the actual palette. `system` follows `prefers-color-scheme` through media queries.

## Layout Contract

- Desktop: app header above a two-column workspace with fixed sidebar and flexible content.
- Medium: sidebar narrows, cards reflow.
- Small: workspace becomes single-column, sidebar appears above content, cards become one column.

## Interaction Contract

- Search input is present but disabled from actual search behavior until the search task.
- Theme segmented control changes local component state only in this task; storage persistence belongs to the theme/storage integration task.
- Mock folder/card rows should communicate future states without pretending real bookmark data is loaded.

## Styling Contract

- Native CSS only.
- No heavy UI framework.
- Use stable dimensions for controls, folder rows, and cards.
- Use icons/symbols as simple text or CSS blocks only for this stage; an icon library can be introduced later only if needed.

