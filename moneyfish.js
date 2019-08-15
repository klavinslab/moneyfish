const AQ = require('./aquarium');
const fs = require('fs');

month = process.argv[2];
year = process.argv[3];
user = process.argv[4];
pw = process.argv[5];
AQ.config.aquarium_url = process.argv[6];

output_file_name = `aquarium_transactions_${month}_${year}.csv`;

fields = [
    "id", 
    "transaction_type", 
    "category", 
    "user_id", 
    "budget_id", 
    "job_id", 
    "operation_id", 
    "labor_rate", 
    "amount", 
    "markup_rate", 
    "created_at",
];

derived_fields = [ 
    "user name", 
    "user email", 
    "operation type name", 
    "budget name", 
    "budget description", 
    "budget contact", 
    "budget contact email", 
    "budget contact phone", 
    "total with overhead", 
    "minutes of labor"
];

function write_csv(transactions, users, operations, operations_types) {
    fs.writeFileSync(output_file_name,fields.join(",") + "," + derived_fields.join(",") + "\n");
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
        let user = get_user(transaction)
        row.push(user.name)
        row.push(get_user_email(user))
        row.push(get_operation_type_name(transaction))
        let budget = get_budget(transaction)
        row.push(budget.name)
        row.push(budget.description)        
        row.push(budget.contact)
        row.push(budget.email)
        row.push(budget.phone)
        row.push(`=I${i}*(1+J${i})`)
        if ( transaction.category == "labor" ) {
            row.push(`=I${i}/H${i}`)
        }
        fs.appendFileSync(output_file_name, row.join(",") + "\n");
        i++;
    })
}

transactions = null;
users = null;
operations = null;
operation_types = null;
budgets = null;
parameters = null;

function get_user(transaction) {
    return aq.find(users, u => u.id == transaction.user_id)
}

function get_operation_type_name(transaction) {
    let op = aq.find(operations, o => o.id == transaction.operation_id);
    return aq.find(operation_types, ot => ot.id == op.operation_type_id).name
}

function get_budget(transaction) {
    return aq.find(budgets, b => b.id == transaction.budget_id)
}

function get_user_email(user) {
    let p = aq.find(parameters, p => p.user_id == user.id && p.key == "email");
    if (p) {
        return p.value;
    } else {
        return "unknown";
    }
}

console.log(`Logging in to ${AQ.config.aquarium_url}`)

AQ.login(user, pw)
  .then(() => console.log("Getting transactions"))    
  .then(() => AQ.Account.where(`MONTH(created_at) = ${month} AND YEAR(created_at) = ${year}`))
  .then(data => transactions = data)
  .then(() => console.log(`Getting user information for ${transactions.length} transactions`))    
  .then(() => AQ.User.where({id: aq.uniq(aq.collect(transactions, t => t.user_id))}))
  .then(data => users = data)
  .then(() => AQ.Parameter.where({user_id: aq.uniq(aq.collect(users, u => u.id))}))
  .then(data => parameters = data)
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






