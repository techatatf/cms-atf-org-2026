SHELL := /bin/sh

ENV ?= dev
SUPPORTED_ENVS := dev prod
COMPOSE_FILES := -f compose.yml -f compose.$(ENV).yml
COMPOSE := docker compose $(COMPOSE_FILES)

ifeq ($(filter $(ENV),$(SUPPORTED_ENVS)),)
$(error ENV must be one of: $(SUPPORTED_ENVS))
endif

.PHONY: help check-compose-files start stop build logs down destroy

help:
	@echo "Backend CMS Docker Compose commands"
	@echo
	@echo "Usage: make <target> [ENV=dev|prod]"
	@echo
	@echo "  start    Start Payload and PostgreSQL in the background"
	@echo "  stop     Stop the containers without removing them"
	@echo "  build    Build the configured service images"
	@echo "  logs     Follow logs from all services"
	@echo "  down     Remove containers and networks, but keep volumes"
	@echo "  destroy  Remove containers, networks, and persistent volumes"
	@echo
	@echo "The default environment is dev."
	@echo "Run destroy with CONFIRM=destroy. This deletes database and media data."

check-compose-files:
	@for file in compose.yml compose.$(ENV).yml; do \
		if [ ! -f "$$file" ]; then \
			echo "Missing backend-cms/$$file"; \
			exit 1; \
		fi; \
	done

start: check-compose-files
	$(COMPOSE) up -d --remove-orphans

stop: check-compose-files
	$(COMPOSE) stop

build: check-compose-files
	$(COMPOSE) build

logs: check-compose-files
	$(COMPOSE) logs --follow

down: check-compose-files
	$(COMPOSE) down --remove-orphans

destroy: check-compose-files
	@if [ "$(CONFIRM)" != "destroy" ]; then \
		echo "Refusing to delete PostgreSQL and media volumes."; \
		echo "Run: make destroy ENV=$(ENV) CONFIRM=destroy"; \
		exit 1; \
	fi
	$(COMPOSE) down --volumes --remove-orphans
