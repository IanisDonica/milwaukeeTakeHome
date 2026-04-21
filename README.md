## How to run it locally

1. Install Docker and Docker-Compose on your machine
2. Run this command in the root project dir
    ```sh
    docker compose up --build
    ```
3. Access the frontend at [http://localhost:5173](http://localhost:5173)

## What would I have done with more time
* Improved the way that permissions are handleded (at the moment warehouse is hardcoded as a special user)
* Split the /transfer and /tools endpoints into a superuser and a regular user ones
* Add more logging features (for example on a transfer log, an administrator can't see the specific tools that were transferred)
* Add a user manager (right now all of the users are created by a script)
* Add a tool manager (same as above)
* Improved the UI logic for the admin accounts