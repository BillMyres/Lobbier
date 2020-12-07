# Lobbier
By: Thomas vanBommel

## Table of Contents
* [About the Experience](#about-the-experience)
  * [Learning Outcomes](#learning-outcomes)
  * [What I Would do Differently Next Time](#what-i-would-do-differently-next-time)
* [About the Project](#about-the-project)
  * [Project Scope](#project-scope)
  * [Project Dependencies](#project-dependencies)
* [Project Setup](#project-setup)
  * [Generate OpenSSL Key-Certificate Pair](#generate-openssl-key-certificate-pair)
  * [Add Server Files to Minikube](#add-server-files-to-minikube)
  * [Add Resources to Minikube](#add-resources-to-minikube)
* [Project Usage](#project-usage)

## About the Experience
First Kubernetes and NodeJS project. I tried my best to document everything well, which includes line-by-line comments.

It's a lobby based chat room, where players can see and interact with one another as long as they're in the same lobby.

* ### Learning Outcomes:
  * How to structure a JavaScript project
  * How to implement Kubernetes into projects
  * Experience with many [NPM](https://www.npmjs.com/) modules

* ### What I Would do Differently Next Time:
  * More error logging, this project was a pain to debug (expected for my first real JavaScript project)
  * Better planning, I gave myself little room for error in this project (time wise)
  * "Single Page" front end to simplify the project files

## About the Project
* ### Project Scope:
  * **NodeJS routing engine / server** for serving the front-end
  * **HTML front-end** where users sign in / up, create new lobbies, and
  interact with other users
  * **PostgreSQL database** to store / retrieve user data

* ### Project Dependencies
  This project uses a combination of some of my favourite tech out today:
  * [PostgreSQL](https://www.postgresql.org/): Used to store user data
  * [NodeJS](https://nodejs.org/en/): Used for network communication + Kubernetes
  changes
    * [cookie-session](https://www.npmjs.com/package/cookie-session): Simple cookie-based session middleware.
    * [passport-local](https://www.npmjs.com/package/passport-local): Passport strategy for authenticating with a username and password.
    * [passport](https://www.npmjs.com/package/passport): Passport is Express-compatible authentication middleware for Node.js.
    * [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for node.
    * [bcrypt](https://www.npmjs.com/package/bcrypt): A library to help you hash passwords.
    * [ejs](https://www.npmjs.com/package/ejs): Embedded JavaScript templates
    * [pg](https://www.npmjs.com/package/pg): Non-blocking PostgreSQL client for Node.js. Pure JavaScript and optional native libpq bindings.
  * [Kubernetes](https://kubernetes.io/): Used as the "backbone", CRUD VMs all day
    * [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/): Local
    version of Kubernetes
  * [Docker](https://www.docker.com/): Used for Kubernetes VM images
    * [DockerHub](https://hub.docker.com/): Used to store / pull custom docker
    images
      * [posgres](https://hub.docker.com/_/postgres): PostgreSQL image
      * [adminer](https://hub.docker.com/_/adminer): Database management tool
      (used to modify the database with ease)
      * [node](https://hub.docker.com/_/node): JavaScript server back-end
  * [GitHub](https://github.com/): Used for project version control

## Project Setup
Since this is a [Kubernetes](https://kubernetes.io/) project, [Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/) and [OpenSSL](https://www.openssl.org/) are the only thing you need to have installed before setting up the rest of this project:

1. ### Generate OpenSSL Key-Certificate Pair
Add a TLS certificate so that our server can communicate through an encrypted tunnel
  * `cd` to the [server](server/) directory
  * Run the following command to generate a `cert.pem` and `key.pem`
  ```bash
  openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
  ```

2. ### Add Server Files to Minikube
To add the server files to minikube (so that our pods read the persistant storage defined in [postgres-deployment.yaml](deployments/postgres-deployment.yaml))
 * To ssh into the minikube container:
 ```bash
 minikube ssh
 ```
 * To create the server directory and change the owner to "docker"
 ```bash
 mkdir /mnt/server-data && chown -R docker /mnt/server-data
 ```
 * You can then exit out of minikube with the help of `ctrl+d`
 * `cd` to the project directory and run the [update-minikube-server-files.sh](update-minikube-server-files.sh) script

3. ### Add Resources to Minikube
Add resources to minikube so our pods / deployments can access that data
 * `cd` to the [deployments](deployments) folder
 * To start and initialize the secrets, postgres and adminer resources run the [start-backend.sh](deployments/start-backend) script
 * Start the server deployment by `kubectl create -f` the [server-deployment.yaml](deployments/server-deployment.yaml) file

## Project Usage
To open the websites font-end simply:
* Ask minikube where the endpoint is:
```bash
minikube service list
```
* Copy / paste the link into a browser, replacing the `http` with `https`.
* Create an account and explore!
