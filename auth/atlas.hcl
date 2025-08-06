data "external_schema" "gorm" {
  program = [
    "go",
    "run",
    "-mod=mod",
    "./cmd/loader",
  ]
}

env "local" {
  dev = "docker://postgres/17/dev?search_path=public"
  url = "postgres://postgres:postgres@localhost:5432/auth?sslmode=disable&search_path=public"
  schema {
    src = data.external_schema.gorm.url
  }
  migration {
    dir = "file://migrations"
    revisions_schema = "atlas_schema_revision"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
