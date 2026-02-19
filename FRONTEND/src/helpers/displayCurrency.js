const displayCEDICurrency = (num) => {
    const formatter = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  })
  
  return formatter.format(num);
}

export default displayCEDICurrency