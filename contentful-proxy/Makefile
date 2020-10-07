
.PHONY: deploy

deploy:
	gcloud functions deploy wnpGET --env-vars-file .env.yaml --runtime nodejs10 --trigger-http --allow-unauthenticated
