import * as shell from "shelljs"

shell.mkdir('dist', 'views')
shell.mkdir('dist', 'public')
shell.cp("-R", "src/views", "dist/views");
shell.cp("-R", "src/public", "dist/public");