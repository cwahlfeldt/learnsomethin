---
title: Docker Basics for Developers
description: Get started with Docker containers for local development
category: devops
tags: ["docker", "containers", "development"]
difficulty: beginner
status: complete
dateCreated: 2025-01-15
estimatedTime: "20 min"
---

# Docker Basics for Developers

Docker has revolutionized the way we develop and deploy applications. This tutorial will get you started with Docker containers for local development.

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers. Containers package your application with all its dependencies, ensuring it runs consistently across different environments.

## Installing Docker

### macOS

Download Docker Desktop from [docker.com](https://docker.com) and follow the installation wizard.

### Linux

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

### Verify Installation

```bash
docker --version
docker run hello-world
```

## Your First Container

Let's run a simple web server:

```bash
docker run -d -p 8080:80 nginx
```

This command:
- `run` - Creates and starts a container
- `-d` - Runs in detached mode (background)
- `-p 8080:80` - Maps port 8080 on your machine to port 80 in the container
- `nginx` - The image to use

Visit `http://localhost:8080` to see your nginx server running!

## Basic Docker Commands

### List Running Containers

```bash
docker ps
```

### Stop a Container

```bash
docker stop <container-id>
```

### Remove a Container

```bash
docker rm <container-id>
```

## Next Steps

Now that you understand the basics, explore:
- Creating your own Dockerfile
- Docker Compose for multi-container applications
- Volume management for persistent data

Docker opens up a world of possibilities for consistent development environments!
