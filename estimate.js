<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimation Tool</title>
    <style>
      /* Basic styling to make the app clean and usable without external CSS */
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      header {
        background: #0d6efd;
        color: white;
        padding: 1rem;
        text-align: center;
      }
      .container {
        max-width: 800px;
        margin: 2rem auto;
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      label {
        display: block;
        margin-top: 1rem;
        font-weight: bold;
      }
      input[type="text"],
      textarea,
      input[type="number"] {
        width: 100%;
        padding: 0.5rem;
        margin-top: 0.25rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
      input[type="file"] {
        margin-top: 0.5rem;
      }
      button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #0d6efd;
        border: none;
        color: white;
        border-radius: 4px;
        cursor: pointer;
      }
      button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }
      th,
      td {
        padding: 0.5rem;
        border: 1px solid #ddd;
        text-align: left;
      }
      th {
        background-color: #f0f0f0;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Estimation Tool</h1>
    </header>
    <div class="container">
      <div id="root"></div>
    </div>

    <!-- React and Babel from CDN -->
    <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script crossorigin src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

    <!-- Our React components -->
    <script type="text/babel" src="App.js"></script>
    <script type="text/babel" src="index.js"></script>
  </body>
</html>