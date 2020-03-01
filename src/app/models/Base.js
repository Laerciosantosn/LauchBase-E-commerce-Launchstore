const db = require("../../config/db")
const fs = require('fs')

function find(filters, table) {
    let query = `SELECT * FROM ${table}`
 
    if(filters) {
        Object.keys(filters).map(key => {
             query += ` ${key} `
             Object.keys(filters[key]).map(field => {
                 query += `${field} = '${filters[key] [field]}'`
             })
        })
    }
    return db.query(query)
}
 
const Base = {
    init({ table }) {
        if(!table) throw new Error('Invalid Params')
        this.table = table
        return this
    },
    async find(id) {
        const results = await find({ WHERE: { id } }, this.table)
        return results.rows[0]
    },
    async findOne(filters) {
        const results = await find(filters, this.table)
        return results.rows[0]
     }, 
    async findAll(filters) {
        
        const results = await find(filters, this.table)
        return results.rows
    },
    async findOneWithDeleted(filters) {
      const results = await find(filters, `${this.table}_with_deleted`)  
      return results.rows[0]
    },
    async create(fields) {
        try {
            let keys = [],
                values = []

            Object.keys(fields).map(key => {
                keys.push(key)
                values.push(`'${fields[key]}'`)
            })

            const query = `INSERT INTO ${this.table} (${keys.join(',')})
                VALUES (${values.join(',')})
                RETURNING id`

            const results = await db.query(query)
            return results.rows[0].id

        }catch (error) {
            console.error(error)   
        }
    },
    update(id, fields) {
        try {
            let update = []

            Object.keys(fields).map(key => {
                const line = `${key} = '${fields[key]}'`
                update.push(line)
            })
    
            let query = `UPDATE ${this.table} SET
            ${update.join(',')} WHERE id = ${id}
            `
    
            return db.query(query)
            
        }catch(error) {
            console.error(error);
        }      
    },
    delete(id){
        try { 
            // logica pra remover fotos da pasta
        // const result = await db.query(`SELECT * FROM files WHERE id = $1`,[id]) 
        // const file = result.rows[0]

        // fs.unlinkSync(file.path)
            // Fim da logica pra remover arquivo da pasta
        return db.query(`DELETE FROM ${this.table} WHERE id = $1`, [id])
        }
        catch(err) {
            console.error(err)
        }
    },
    deleteFiles(id) {
        return db.query(`DELETE FROM files WHERE product_id = $1`, [id])
    }
}
   
module.exports = Base