FROM python:3.10-bullseye as base

ENV PYTHONUNBUFFERED 1

# to reduce list of security founded issues, we install all known security updates.
RUN apt-get update && apt-get -y upgrade

# Move pipfiles to project.
RUN mkdir -p /app
WORKDIR /app

ADD Pipfile ./
ADD Pipfile.lock ./

RUN pip install -U pip pipenv

FROM base as prod-build-python

# copy migrations script
COPY ./scripts/migrations.sh /bin/migrations.sh
RUN chmod +x /bin/migrations.sh

RUN pipenv install --system --verbose --deploy

# pipenv license is configured badly, because they past the whole license text instead of just the name.
# To go around this, we decided to unistall pipenv in the prod image.
RUN pip uninstall -y pipenv

FROM base as dev-build-python

RUN pipenv install --system --verbose --deploy --dev

### Dev image used for loca development (bigger than prod image)
FROM dev-build-python as dev

COPY . /app/

RUN addgroup --system --gid 1001 backend
RUN adduser --system --uid 1001 dev-user && chown -R dev-user /app

USER dev-user

# Create aka env-file to avoid warnings
RUN touch ./aka/config/.env

EXPOSE 8000

CMD ["./scripts/run_backend_local.sh"]

### Prod image
FROM python:3.10-slim-bullseye as prod

ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install --no-install-recommends -y \
    libmariadb-dev \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=prod-build-python /usr/local/lib/python3.10/site-packages/ /usr/local/lib/python3.10/site-packages/
COPY --from=prod-build-python /usr/local/bin/ /usr/local/bin/
COPY --from=prod-build-python /bin/migrations.sh /bin/

COPY . /app/
WORKDIR /app

# Compress static files --force is required to make it run locally
RUN python manage.py compress --force

# Run collectstatic for whitenoise
RUN python ./manage.py collectstatic --noinput

RUN addgroup --system --gid 1001 backend
RUN adduser --system --uid 1001 prod-user && chown -R prod-user /app

USER prod-user

# Create aka env-file to avoid warnings
RUN touch ./aka/config/.env

EXPOSE 8000

CMD ["exec", "gunicorn", "cool_counter.config.wsgi:application", "--bind","0.0.0.0:8000", "--workers 3 --timeout 600"]
