## AI Usage Disclosure and Optimization Notes

### What I used AI for
- I asked ChatGPT to scan the codebase and suggest optimizations to make code run more efficienlty.
- I validated each suggestion against MDN/Web standards before applying.

### Changes implemented
1) Avoid `innerHTML` for appending large blocks
   - **Before**:
     - `document.body.innerHTML += widgetHTML;`
     - `timelineElement.innerHTML += html;`
   - **Why change**:
     - Using `innerHTML` to append causes the browser to reparse and recreate descendant nodes, which is less efficient than DOM APIs.
   - **After**:
     - Use a `<template>` element and `insertBefore` to attach the widget at the top of `<body>` without reparsing the entire document.
     - Use `document.createElement` + `appendChild` for timeline items.
     - Did not use createElement and appendChild because the single template string is more eadable and maintainable. We still avoid innerHTML += by parsing once via <template> and inserting with insertBefore, so no full body reparse or event listener loss.
   - **References (MDN)**:
     - [Node.insertBefore](https://developer.mozilla.org/docs/Web/API/Node/insertBefore)
     - [Document.createElement](https://developer.mozilla.org/docs/Web/API/Document/createElement)
     - [`<template>` element](https://developer.mozilla.org/docs/Web/HTML/Element/template)

### Rationale
- These changes reduce unnecessary reparsing and reflow while keeping the exact DOM structure and behavior required by the requirements.

### Scope of AI assistance
- Limited to suggesting improvements (e.g., prefer DOM APIs over `innerHTML` for appends).
- Final decisions and code were reviewed and applied by me after checking MDN docs.

