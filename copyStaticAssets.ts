import * as shell from "shelljs"

shell.mkdir('dist', 'views')
shell.cp("-R", "src/views", "dist/views");