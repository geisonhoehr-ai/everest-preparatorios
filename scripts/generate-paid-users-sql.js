import { parse } from "csv-parse"

async function generatePaidUsersSql() {
  const csvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/membros-2025-07-19_14-14-fRB4uyxuEPW01Gt7cbSk3H7etKgBuy.csv"

  try {
    console.log("Fetching CSV data from:", csvUrl)
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }

    const csvContent = await response.text()
    console.log("CSV data fetched successfully. Parsing...")

    const records = await new Promise((resolve, reject) => {
      parse(
        csvContent,
        {
          columns: true, // Treat the first row as column headers
          skip_empty_lines: true,
          trim: true,
        },
        (err, records) => {
          if (err) reject(err)
          resolve(records)
        },
      )
    })

    if (!records || records.length === 0) {
      console.log("No records found in CSV.")
      return
    }

    const emails = records.map((record) => record["E-mail"]).filter((email) => email) // Extract 'E-mail' column and filter out empty ones

    if (emails.length === 0) {
      console.log("No valid emails found in the CSV.")
      return
    }

    let sql = `-- Script gerado automaticamente para inserir e-mails do Memberkit na tabela paid_users\n`
    sql += `-- Data de geração: ${new Date().toISOString()}\n\n`
    sql += `INSERT INTO paid_users (email) VALUES\n`

    const values = emails.map((email) => `('${email}')`).join(",\n")
    sql += values + `\nON CONFLICT (email) DO NOTHING;`

    console.log("\n--- SQL Script Generated ---\n")
    console.log(sql)
    console.log("\n--- End of SQL Script ---")
  } catch (error) {
    console.error("Error generating SQL:", error)
  }
}

generatePaidUsersSql()
