data "external_schema" "drizzle" {
    program = [ 
      "bun",
      "run",
      "db:export",
    ]
}

env "local" {
  dev = "docker://postgres/17/dev"
  url = "postgres://postgres:postgres@localhost:5432/auth?sslmode=disable&search_path=public"
  schema {
    src = data.external_schema.drizzle.url
  }
  migration {
    dir = "file://migrations"
  }
}
