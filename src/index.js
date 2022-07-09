
async function AddList(){
    var url = "https://www.reclameaqui.com.br/empresa/grupo-recovery-renova-securitizadora-fidc-recovery-e-fidc-npl1/lista-reclamacoes/?pagina=";
    var list = [];
    i = 1;
    x = 10
    while (i <= x){
        list.push(url + i);
        i++
    }
    return list
}

list = AddList();
console.log(list);