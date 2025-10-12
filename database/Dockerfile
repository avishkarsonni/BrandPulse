# Database Dockerfile for PostgreSQL
FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=brandpulse
ENV POSTGRES_USER=brandpulse_user
ENV POSTGRES_PASSWORD=brandpulse_password

# Copy initialization scripts
COPY schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY seed_data.sql /docker-entrypoint-initdb.d/02-seed_data.sql

# Create custom configuration
RUN echo "shared_preload_libraries = 'pg_stat_statements'" >> /usr/local/share/postgresql/postgresql.conf.sample
RUN echo "pg_stat_statements.track = all" >> /usr/local/share/postgresql/postgresql.conf.sample
RUN echo "log_statement = 'all'" >> /usr/local/share/postgresql/postgresql.conf.sample

# Expose port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

