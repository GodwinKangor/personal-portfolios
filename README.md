# Godwin Kangor — Personal Portfolio

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

A personal notebook/showcase site covering software engineering, ML/data, and 3D/design work, with a light/dark theme, a filterable project index, and a small interactive interest map. Built with plain React + CSS (no UI framework) — see `src/data/` for the editable profile, project, and capability content, and `src/App.css` for the design tokens and layout.

## Environment variables

Copy `.env.example` to `.env` and fill in what you need. Both integrations degrade gracefully when unset:

- `REACT_APP_FORMSPREE_ID` — enables the contact form (Formspree). Without it, the Contact section shows GitHub/LinkedIn links instead of a form that would submit nowhere.
- `REACT_APP_MAILCHIMP_URL` / `REACT_APP_MAILCHIMP_U` / `REACT_APP_MAILCHIMP_ID` — enables the footer newsletter signup. The signup is hidden unless all three are set.

In the /personal-portfolio, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
