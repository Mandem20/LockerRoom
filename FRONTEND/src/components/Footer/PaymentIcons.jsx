import React from 'react'
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa'

const MTNIcon = () => (
  <span className="text-[10px] font-bold text-black bg-[#FFCD00] px-1.5 py-0.5 rounded">MTN</span>
)

const TelecelIcon = () => (
  <span className="text-[10px] font-bold text-white bg-[#E60000] px-1.5 py-0.5 rounded">T</span>
)

const ATIcon = () => (
  <span className="text-[10px] font-bold text-white bg-[#0066CC] px-1 py-0.5 rounded">AT</span>
)

const PaymentIcons = ({ t }) => {
  const defaultT = {
    weAccept: 'We Accept',
    mobileMoney: 'Mobile Money'
  }

  const translations = t || defaultT

  const payments = [
    { name: 'Visa', icon: FaCcVisa, color: '#1A1F71' },
    { name: 'Mastercard', icon: FaCcMastercard, color: '#EB001B' },
  ]

  const mobileMoney = [
    { name: 'MTN Mobile Money', icon: MTNIcon },
    { name: 'Telecel', icon: TelecelIcon },
    { name: 'AirtelTigo', icon: ATIcon }
  ]

  return (
    <div className='flex flex-wrap items-center gap-6'>
      <div className='flex items-center gap-3'>
        <span className='text-[#a0a0a0] text-xs font-light uppercase tracking-wider'>{translations.weAccept}</span>
        <div className='flex gap-2'>
          {payments.map((payment, index) => (
            <div 
              key={index}
              className='w-8 h-5 flex items-center justify-center bg-white rounded-sm'
              title={payment.name}
            >
              <payment.icon color={payment.color} size={16} />
            </div>
          ))}
        </div>
      </div>
      
      <div className='flex items-center gap-3'>
        <span className='text-[#a0a0a0] text-xs font-light uppercase tracking-wider'>{translations.mobileMoney}</span>
        <div className='flex gap-2'>
          {mobileMoney.map((network, index) => (
            <div 
              key={index}
              className='flex items-center justify-center rounded-sm'
              title={network.name}
            >
              <network.icon />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PaymentIcons
