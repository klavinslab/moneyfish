const AQ = require('./aquarium');
const fs = require('fs');

month = process.argv[2];
year = process.argv[3];
user = process.argv[4];
pw = process.argv[5];
AQ.config.aquarium_url = process.argv[6];

output_file_name = `aquarium_transactions_${month}_${year}.csv`;

fields = [
    "id", "transaction_type", "category", "user_id", "budget_id", "job_id", "operation_id", "labor_rate", "amount", "markup_rate", "created_at",
]

derived_fields = [ "user name", "operation type name", "budget name", "budget contact", "total with overhead", "minutes of labor" ]

function write_csv(transactions, users, operations, operations_types) {
    fs.writeFileSync(output_file_name,fields.join(",") + "," + derived_fields.join(","));
    i = 2;
    aq.each(transactions, transaction => {
        row = [];
        aq.each(fields, field => {
            if(field != "created_at") {
                row.push(transaction[field])
            } else {
                let d = new Date(transaction[field]);
                row.push(d.toLocaleDateString())
            }
        })
        row.push(get_user_name(transaction))
        row.push(get_operation_type_name(transaction))
        row.push(get_budget_name(transaction))
        row.push(get_budget_contact(transaction))
        row.push(`=I${i}*(1+J${i})`)
        if ( transaction.category == "labor" ) {
            row.push(`=I${i}/H${i}`)
        }
        fs.appendFileSync(output_file_name, row.join(","));
        i++;
    })
}

transactions = null;
users = null;
operations = null;
operation_types = null;
budgets = null;

function get_user_name(transaction) {
    return aq.find(users, u => u.id == transaction.user_id).name
}

function get_operation_type_name(transaction) {
    let op = aq.find(operations, o => o.id == transaction.operation_id);
    return aq.find(operation_types, ot => ot.id == op.operation_type_id).name
}

function get_budget_name(transaction) {
    return aq.find(budgets, b => b.id == transaction.budget_id).name
}

function get_budget_contact(transaction) {
    return aq.find(budgets, b => b.id == transaction.budget_id).contact
}

console.log(`Logging in to ${AQ.config.aquarium_url}`)
AQ.login(user, pw)
  .then(() => console.log("Getting transactions"))    
  .then(() => AQ.Account.where(`MONTH(created_at) = ${month} AND YEAR(created_at) = ${year}`))
  .then(data => transactions = data)
  .then(() => console.log(`Getting user information for ${transactions.length} transactions`))    
  .then(() => AQ.User.where({id: aq.uniq(aq.collect(transactions, t => t.user_id))}))
  .then(data => users = data)
  .then(() => console.log("Getting budget information")) 
  .then(() => AQ.Budget.where({id: aq.uniq(aq.collect(transactions, t => t.budget_id)) }))
  .then(data => budgets = data)   
  .then(() => console.log("Getting operation information"))       
  .then(() => AQ.Operation.where({id: aq.uniq(aq.collect(transactions, t => t.operation_id)) }))
  .then(data => operations = data)
  .then(() => AQ.OperationType.where({id: aq.uniq(aq.collect(operations, o => o.operation_type_id))}))
  .then(data => operation_types = data)
  .then(() => console.log(`Writing to file ${output_file_name}`))    
  .then(() => write_csv(transactions, users, operations, operation_types))
  .then(() => console.log(`Done`))    
  .catch(error => {
      console.log("Error", error)
  })






