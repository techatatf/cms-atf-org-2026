CMS_DIR := backend-cms
ENV ?= dev

.PHONY: help start stop build logs down destroy

help:
	@$(MAKE) -s -C $(CMS_DIR) help ENV=$(ENV)

start stop build logs down destroy:
	@$(MAKE) -C $(CMS_DIR) $@ ENV=$(ENV) CONFIRM="$(CONFIRM)"
