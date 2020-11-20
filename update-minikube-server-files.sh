#!/bin/bash

scp -rpi $(minikube ssh-key) server/* docker@$(minikube ip):/mnt/server-data
