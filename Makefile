default:
	@echo 'make lint		-- to lint the code'
	@echo 'make clean		-- to freshly start'

clean:
	@echo 'Cleaning your environment...'
	rm -rf ./node_modules/ yarn.lock
	@echo 'Success :)'

lint:
	@echo 'Linting your files...'
	@./node_modules/.bin/eslint \
		index.js \
		./lib/**/* \
		--config .eslintrc.yml
	@echo 'Success :)'
