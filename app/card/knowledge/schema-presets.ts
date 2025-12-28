import { CardSchema } from './types'

export const SAMPLE_SCHEMA: CardSchema = {
  schema: '2.0',
  config: {
    update_multi: true,
  },
  body: {
    direction: 'vertical',
    elements: [
      {
        tag: 'column_set',
        flex_mode: 'stretch',
        horizontal_spacing: '12px',
        horizontal_align: 'left',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            background_style: 'blue-50',
            elements: [
              {
                tag: 'markdown',
                content: "## <font color='blue'>${p_price}</font>",
                text_align: 'center',
                text_size: 'normal',
              },
              {
                tag: 'markdown',
                content: "<font color='grey'>发行价格(HKD)</font>",
                text_align: 'center',
                text_size: 'normal',
              },
            ],
            padding: '12px 12px 12px 12px',
            vertical_spacing: '2px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            background_style: 'blue-50',
            elements: [
              {
                tag: 'markdown',
                content: "## <font color='blue'>${p_num}</font>",
                text_align: 'center',
                text_size: 'normal',
              },
              {
                tag: 'markdown',
                content: "<font color='grey'>每手股数</font>",
                text_align: 'center',
                text_size: 'normal',
              },
            ],
            padding: '12px 12px 12px 12px',
            vertical_spacing: '2px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            background_style: 'blue-50',
            elements: [
              {
                tag: 'markdown',
                content: "## <font color='blue'>${onehand_usd}</font>",
                text_align: 'center',
                text_size: 'normal',
              },
              {
                tag: 'markdown',
                content: "<font color='grey'>一手资金(HKD)</font>",
                text_align: 'center',
                text_size: 'normal',
              },
            ],
            padding: '12px 12px 12px 12px',
            vertical_spacing: '2px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
        ],
        margin: '0px 0px 0px 0px',
      },
      {
        tag: 'column_set',
        flex_mode: 'stretch',
        horizontal_spacing: '12px',
        horizontal_align: 'left',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            background_style: 'blue-50',
            elements: [
              {
                tag: 'markdown',
                content: "**<font color='blue'>基石：${jishi}</font>**",
                text_align: 'center',
                text_size: 'normal',
              },
            ],
            padding: '12px 12px 12px 12px',
            vertical_spacing: '2px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            background_style: 'blue-50',
            elements: [
              {
                tag: 'markdown',
                content: "**<font color='blue'>回拨：${huibo}</font>**",
                text_align: 'center',
                text_size: 'normal',
              },
            ],
            padding: '12px 12px 12px 12px',
            vertical_spacing: '2px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            background_style: 'blue-50',
            elements: [
              {
                tag: 'markdown',
                content: "**<font color='blue'>绿鞋：${lvxie}</font>**",
                text_align: 'center',
                text_size: 'normal',
              },
            ],
            padding: '12px 12px 12px 12px',
            vertical_spacing: '2px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
        ],
        margin: '0px 0px 0px 0px',
      },
      {
        tag: 'markdown',
        content: '**公司简介**\n${complany_desc}',
        text_align: 'left',
        text_size: 'normal',
        margin: '0px 0px 0px 0px',
      },
      {
        tag: 'table',
        columns: [
          {
            data_type: 'text',
            name: 'year',
            display_name: '年份',
            horizontal_align: 'left',
            width: 'auto',
          },
          {
            data_type: 'text',
            name: 'income',
            display_name: '收入(亿)',
            horizontal_align: 'left',
            width: 'auto',
          },
          {
            data_type: 'text',
            name: 'gross_profit',
            display_name: '毛利(亿)',
            horizontal_align: 'left',
            width: 'auto',
          },
          {
            data_type: 'text',
            name: 'profit',
            display_name: '年内利润(亿)',
            horizontal_align: 'left',
            width: 'auto',
          },
        ],
        rows: [
          {
            year: '2022年',
            income: '340.56',
            gross_profit: '27.28',
            profit: '-52.21',
          },
          {
            year: '2023年',
            income: '357.89',
            gross_profit: '25.71',
            profit: '-41.57',
          },
          {
            year: '2024年',
            income: '1451.14',
            gross_profit: '345.51',
            profit: '47.4',
          },
        ],
        row_height: 'low',
        header_style: {
          text_align: 'left',
          background_style: 'grey',
          bold: true,
          lines: 1,
        },
        page_size: 5,
        margin: '0px 0px 0px 0px',
      },
      {
        tag: 'hr',
        margin: '0px 0px 0px 0px',
      },
      {
        tag: 'column_set',
        flex_mode: 'stretch',
        horizontal_spacing: '12px',
        horizontal_align: 'left',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            elements: [
              {
                tag: 'markdown',
                content: "<font color='grey'>认购截止日期</font>\n**${end_date}**",
                text_align: 'left',
                text_size: 'normal',
              },
            ],
            vertical_spacing: '8px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            elements: [
              {
                tag: 'markdown',
                content: "<font color='grey'>暗盘日期</font>\n**${dark_date}**",
                text_align: 'left',
                text_size: 'normal',
              },
            ],
            vertical_spacing: '8px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            elements: [
              {
                tag: 'markdown',
                content: "<font color='grey'>上市日期</font>\n**${publish_date}**",
                text_align: 'left',
                text_size: 'normal',
              },
            ],
            vertical_spacing: '8px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
        ],
        margin: '0px 0px 0px 0px',
      },
      {
        tag: 'column_set',
        flex_mode: 'stretch',
        horizontal_spacing: '12px',
        horizontal_align: 'left',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            elements: [
              {
                tag: 'markdown',
                content: "<font color='grey'>公开发售数量</font>\n**${public_number}**",
                text_align: 'left',
                text_size: 'normal',
              },
            ],
            vertical_spacing: '8px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            elements: [
              {
                tag: 'markdown',
                content: "<font color='grey'>国际发售数量</font>\n**${international_num}**",
                text_align: 'left',
                text_size: 'normal',
              },
            ],
            vertical_spacing: '8px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            elements: [
              {
                tag: 'markdown',
                content: "<font color='grey'>发行数量</font>\n**${public_sell_num}**",
                text_align: 'left',
                text_size: 'normal',
              },
            ],
            vertical_spacing: '8px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
        ],
        margin: '0px 0px 0px 0px',
      },
      {
        tag: 'column_set',
        flex_mode: 'stretch',
        horizontal_spacing: '12px',
        horizontal_align: 'left',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            elements: [
              {
                tag: 'markdown',
                content: "<font color='grey'>保荐人</font>\n**${baojianren}**",
                text_align: 'left',
                text_size: 'normal',
              },
            ],
            vertical_spacing: '8px',
            horizontal_align: 'left',
            vertical_align: 'top',
            weight: 1,
          },
          {
            tag: 'column',
            width: 'weighted',
            background_style: 'bg-white',
            elements: [
              {
                tag: 'markdown',
                content:
                  "<font color='grey'>近期新股涨幅</font>\n**佳鑫国际资源: <font color='green'>177.84%</font>**  **健康160: <font color='red'>177.84%</font>** ",
                text_align: 'left',
                text_size: 'normal',
              },
            ],
            padding: '0px 0px 0px 0px',
            direction: 'vertical',
            horizontal_spacing: '8px',
            vertical_spacing: '8px',
            horizontal_align: 'left',
            vertical_align: 'top',
            margin: '0px 0px 0px 0px',
            weight: 2,
          },
        ],
        margin: '0px 0px 0px 0px',
      },
    ],
  },
  header: {
    title: {
      tag: 'plain_text',
      content: '${complany_name} 新股认购',
    },
    subtitle: {
      tag: 'plain_text',
      content: '★★★★★',
    },
    text_tag_list: [
      {
        tag: 'text_tag',
        text: {
          tag: 'plain_text',
          content: '${stock_code}',
        },
        color: 'orange',
      },
    ],
    template: 'blue',
    padding: '12px 16px 12px 16px',
  },
}
