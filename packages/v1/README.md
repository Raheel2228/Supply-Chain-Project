# Capabl Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environment Variables

- The frontend requires a number of non-secret environment variables to run (and they end up in the public deployed build).
- To run locally, put these in a `.env.development` file in the root of this directory.
- See `example.env` for the dev/local variables (this may not be up-to-date), and see the Amplify site configuration for actual values.

## Running Locally

- The default configuration (in `src/config.ts`) expects the backend API to be running at http://localhost:8080.
- Run `npm start` in the project directory to start the app in development mode.
- Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

- There are two Code Pipelines on AWS connected to this repository, for the `dev` and `prod` branches.
- Any pushes/merges to these branches will trigger deployment on the corresponding AWS Amplify site:
  - Dev: [https://dev.capabl.co](https://dev.capabl.co)
  - Prod: [https://www.capabl.co](https://www.capabl.co)

---

_Create React App README below_

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
