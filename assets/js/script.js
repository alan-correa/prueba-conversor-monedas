const pesos = document.querySelector("#inputClp")
const monedaSeleccionada = document.querySelector("#monedaSeleccionada")
const boton = document.querySelector("#boton")
const monedaConvertida = document.querySelector("#monedaConvertida")
const miGraf = document.querySelector("#myChart")
let myChart //VARIABLE CONTENEDORA GRAFICO
const apiUrl = "https://mindicador.cl/api" //ENDPOINT PRINCIPAL

async function obtenerMonedas(url) {
    try {
        const res = await fetch(url)
        const monedas = await res.json()
        return monedas
    } catch (error) {
        alert("Error al cargar la API. Favor intente de nuevo!")
        return
    }
}

async function renderConvierteMonedas() {
    try {
        const monedas = await obtenerMonedas(apiUrl)
        let tipoMoneda = "" 
        if (monedas[monedaSeleccionada.value].codigo === "dolar") {
            tipoMoneda = "USD"
        } else {
            tipoMoneda = "EUR"
        }
        monedaConvertida.innerHTML = `Resultado: ${new Intl.NumberFormat("en-US", { //SE REINICIA A TIPO MONEDA
            style: "currency",
            currency: tipoMoneda //SIGNO MONETARIO CORRESPONDIENTE
        }).format((pesos.value / monedas[monedaSeleccionada.value].valor).toFixed(2))}` //REDONDEA
    }
    catch (error) {
        alert("Seleccione Moneda a convertir")
    }
}

boton.addEventListener("click", () => {
    if (pesos.value == "" || pesos.value <= 0) {
        alert("Ingrese un monto mayor a CERO")
        pesos.value = ""
        return
    }
    renderConvierteMonedas() //FUNCION PRINCIPAL
    graficoTotal()
})

function graficoTotal() {
    async function cargaDatosParaGrafico() {
        try {
            const urlGrafico = await fetch(apiUrl + "/" + monedaSeleccionada.value); //DATOS HISTORICOS
            const datosGrafico = await urlGrafico.json()

            const label = datosGrafico.serie.map((ejeX) => {
                return ejeX.fecha.split("T")[0]; //METODO SPLIT DIVIDE LA CADENA DE TEXTO HASTA LA "T" Y OBVIA EL RESTO
            })
            const labels = label.reverse().splice(-10) //ORDENA EL EJE X

            const datosY = datosGrafico.serie.map((ejeY) => {
                const valorEjeY = ejeY.valor
                return Number(valorEjeY)
            })
            const data = datosY.reverse().splice(-10)
            const datasets = [
                {
                    label: "Historial últimos 10 días " + monedaSeleccionada.value,
                    borderColor: "rgb(255, 99, 132)",
                    data
                }
            ]

            return { labels, datasets }
        } catch (error) {
            alert("No se puede cargar los datos para el gráfico :(")
        }
    }

    async function renderGrafica() {
        const data = await cargaDatosParaGrafico()

        const config = {
            type: "line",
            data
        };
        miGraf.style.backgroundColor = "white"

        if (myChart) {
            myChart.destroy(); //FUNCION PARA ACTUALIZAR EL GRAFICO SI SE CAMBIA EL TIPO DE MONEDA
        }
        myChart = new Chart(miGraf, config)
    }

    renderGrafica()
}