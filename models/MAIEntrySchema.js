class MAIEntrySchema {
    constructor(values) {
        this.entry = {
            blue: 
            {
                id: values[0],
                app_name: values[1],
                norm_app_name: values[3],
                description: values[4],
                business_critic: values[5],
                life_cycle_state: values[6],
                usr_community: values[7],
                business_owner: values[8],
                business_dept_owners: values[9],
                managed_by: values[10],
                managed_dept: values[11],
                managed_by_owner: values[12],
            },
            green: 
            {
                app_type: values[13],
                app_delivery: values[14],
                platform: values[15],
                num_integrations: values[16],
                num_ROM: values[17],
                num_IT_supp: values[18],
                cobblestone_id: values[19],
                vendor: values[20],
                num_license: values[21],
                annual_cost: values[22], 
                contract_dates: values[23],
                details: values[24], 
                updated_date: values[25],
            },
            pink:
            {
                educause_cat: values[26],
                educause_service: values[27],
                caudit_capability: values[28],
                core_enable: values[29],
                wip: values[30],
                common_gd: values[31],
            }
        }    
    }

    async getEntry() {
        try {
            return this.entry;
        }
        catch (err) {
            console.log('Error getting entry info: ', err);
        }
    }
}

module.exports = MAIEntrySchema;