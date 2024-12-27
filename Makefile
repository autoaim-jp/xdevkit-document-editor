SHELL=/bin/bash
PHONY=default init run rebuild help 
DOCKER_PROJECT_NAME=mermaid-chatgpt-editor

.PHONY: $(PHONY)

default: run-d

run-d: docker-compose-up-detatch
run: docker-compose-up
rebuild: docker-compose-down docker-compose-build

help:
	@echo "Usage: make run-d"
	@echo "Usage: make run"
	@echo "Usage: make help"

docker-compose-up-detatch:
	docker compose -p ${DOCKER_PROJECT_NAME} up -d

docker-compose-up:
	docker compose -p ${DOCKER_PROJECT_NAME} up

docker-compose-down:
	docker compose -p ${DOCKER_PROJECT_NAME} down --volumes

docker-compose-build:
	docker compose -p ${DOCKER_PROJECT_NAME} build



