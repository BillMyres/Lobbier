<!-- HEADING -->
# Lobbier
**IN PROGRESS**

Lobby (pod) based chat room / game

<!-- TABLE OF CONTENTS -->
## Table of Contents
* [About the Project](#about-the-project)
  * [Project Scope](#project-scope)
  * [Project Dependencies](#project-dependencies)
  * [TODO](#todo)
* [Getting Started](#getting-started)
  * [Minikube](#minikube)
    * [Resources](#resources)
  * [PostgreSQL](#postgresql)
  * [Adminer](#adminer)
* [Installation](#installation)
* [Usage Examples](#usage)

<!-- ABOUT THE PROJECT -->
## About the Project
This is a fun project to try to integrateKubernetes with a project for my portfolio and to share with others.


### Project scope:
* **NodeJS routing engine / server** will route network traffic to correct pods
and serve the front-end + static files
* **HTML front-end** where users sign in / up, create new rooms (pods), and
interact with other users
* **PostgreSQL database** to store / retrieve user data

### Project Dependencies
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


### TODO
* [x] **11-16-2020** Create database
  * [postgres-deployment.yaml](deployments/postgres-deployment.yaml)
  * [adminer-deployment.yaml](deployments/adminer-deployment.yaml)
* [x] **11-19-2020** Create server (+1 day)
  * [application-secrets.yaml](deployments/application-secrets.yaml)
  * [server-deployment.yaml](deployments/server-deployment)
  * [website](website)
  * [app.js](app.js)
* [ ] **11-23-2020** Create lobby
* [ ] **11-25-2020** Integrate server + lobby
* [ ] **11-26-2020** Testing
* [ ] **11-29-2020** Fix Issues

<!-- GETTING STARTED -->
## Getting Started
It's a good idea to have some experience with Docker + Kubernetes before reading
through this guide on setup, however not required.


To learn more about:
* Kubernetes visit their website @ https://kubernetes.io/
* Docker visit their website @ https://www.docker.com/

### Minikube
Minikube is a local Kubernetes, making it much simpler for development purposes.
I will not be giving a tutorial on how to install Minikube, a good place to
start would be [here](https://minikube.sigs.k8s.io/docs/start/)


Minikube will give you the power to manage your cluster from the command line
using the `minikube` and `kubectl` commands.


Helpful commands:
* `minikube dashboard`: opens the Kubernetes dashboard, from here you can do
most things that you could from the command line, with a nice interface
* `minikube ssh`: Log into the Minikube environment (for debugging)
* `minikube status`: Gets the status of a local Kubernetes cluster
* `kubectl create`: Create a resource from a file or stdin
* `kubectl delete`: Delete resources specified in a file or stdin


I like to keep the dashboard open in a tab on my browser, just to have an
overview of whats going on in the cluster.

![Kubernetes dashboard image][kubernetes-dashboard]

Separating resources into separate `.yaml` files is also a smart idea, keeping
everything tidy and organized. I have create my resources so that I have a file
containing all the resouces for Postgres, one for Adminer, one for the Node
routing engine, and another for the Node "lobby" pods.


#### Resources
[application-secrets.yaml](deployments/application-secrets.yaml)
* Secret for storing Postgres login data and database name

[server-deployment.yaml](deployments/server-deployment.yaml)
* PersistentVolume for storage
* PersistentVolumeClaim for code storage
* Deployment for Postgres NodeJS image with the server files
* Service to expose application to the public

[postgres-deployment.yaml](deployments/postgres-deployment.yaml)
* PersistentVolume for application storage
* PersistentVolumeClaim for Postgres data
* Deployment for Postgres database
* Service to expose application to other pods

[adminer-deployment.yaml](deployments/adminer-deployment.yaml)
* Deployment for Adminer PHP application
* Service to expose application to the public

### PostgreSQL
"The worlds most advanced open source database" is a powerful, relational database system with 30+ years of development. A solid choice for any project.

Thankfully they've created a docker image available freely on the DockerHub. With just a few environment variables we can set the root username, password, and database name.

### Adminer
Adminer (formerly phpMinAdmin) is a database management in a single PHP file.
It's lightweight and has a great UI (...well multiple UI's) which helps get
things done quickly.

## Installation
Kubernetes will do most of the work for you. Just run these commands to get up
and running quickly!

```bash
cd $PROJECT_DIR #1
kubectl create -f deployments/application-secrets.yaml
kubectl create -f deployments/postgres-deployment.yaml
kubectl create -f deployments/server-deployment.yaml
kubectl create -f deployments/adminer-deployment.yaml # not required
```

## Usage
To access public, accessable services type the following:
```bash
minikube service list
```
You should then receive a list of links to the public services running on minikube

Minikube service response
![Minikube services response][minikube-services]

<!-- VALUES -->
[minikube-services]: documentation/images/minikube-services.png
[kubernetes-dashboard]: documentation/images/dashboard.png
