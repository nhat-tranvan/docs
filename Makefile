.PHONY: up

up:
	bash -c 'source ~/.nvm/nvm.sh && nvm use 22 && mintlify dev'
