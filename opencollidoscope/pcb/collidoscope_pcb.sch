<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE eagle SYSTEM "eagle.dtd">
<eagle version="7.5.0">
<drawing>
<settings>
<setting alwaysvectorfont="no"/>
<setting verticaltext="up"/>
</settings>
<grid distance="0.1" unitdist="inch" unit="inch" style="lines" multiple="1" display="no" altdistance="0.01" altunitdist="inch" altunit="inch"/>
<layers>
<layer number="1" name="Top" color="4" fill="1" visible="no" active="no"/>
<layer number="16" name="Bottom" color="1" fill="1" visible="no" active="no"/>
<layer number="17" name="Pads" color="2" fill="1" visible="no" active="no"/>
<layer number="18" name="Vias" color="2" fill="1" visible="no" active="no"/>
<layer number="19" name="Unrouted" color="6" fill="1" visible="no" active="no"/>
<layer number="20" name="Dimension" color="15" fill="1" visible="no" active="no"/>
<layer number="21" name="tPlace" color="7" fill="1" visible="no" active="no"/>
<layer number="22" name="bPlace" color="7" fill="1" visible="no" active="no"/>
<layer number="23" name="tOrigins" color="15" fill="1" visible="no" active="no"/>
<layer number="24" name="bOrigins" color="15" fill="1" visible="no" active="no"/>
<layer number="25" name="tNames" color="7" fill="1" visible="no" active="no"/>
<layer number="26" name="bNames" color="7" fill="1" visible="no" active="no"/>
<layer number="27" name="tValues" color="7" fill="1" visible="no" active="no"/>
<layer number="28" name="bValues" color="7" fill="1" visible="no" active="no"/>
<layer number="29" name="tStop" color="7" fill="3" visible="no" active="no"/>
<layer number="30" name="bStop" color="7" fill="6" visible="no" active="no"/>
<layer number="31" name="tCream" color="7" fill="4" visible="no" active="no"/>
<layer number="32" name="bCream" color="7" fill="5" visible="no" active="no"/>
<layer number="33" name="tFinish" color="6" fill="3" visible="no" active="no"/>
<layer number="34" name="bFinish" color="6" fill="6" visible="no" active="no"/>
<layer number="35" name="tGlue" color="7" fill="4" visible="no" active="no"/>
<layer number="36" name="bGlue" color="7" fill="5" visible="no" active="no"/>
<layer number="37" name="tTest" color="7" fill="1" visible="no" active="no"/>
<layer number="38" name="bTest" color="7" fill="1" visible="no" active="no"/>
<layer number="39" name="tKeepout" color="4" fill="11" visible="no" active="no"/>
<layer number="40" name="bKeepout" color="1" fill="11" visible="no" active="no"/>
<layer number="41" name="tRestrict" color="4" fill="10" visible="no" active="no"/>
<layer number="42" name="bRestrict" color="1" fill="10" visible="no" active="no"/>
<layer number="43" name="vRestrict" color="2" fill="10" visible="no" active="no"/>
<layer number="44" name="Drills" color="7" fill="1" visible="no" active="no"/>
<layer number="45" name="Holes" color="7" fill="1" visible="no" active="no"/>
<layer number="46" name="Milling" color="3" fill="1" visible="no" active="no"/>
<layer number="47" name="Measures" color="7" fill="1" visible="no" active="no"/>
<layer number="48" name="Document" color="7" fill="1" visible="no" active="no"/>
<layer number="49" name="Reference" color="7" fill="1" visible="no" active="no"/>
<layer number="51" name="tDocu" color="7" fill="1" visible="no" active="no"/>
<layer number="52" name="bDocu" color="7" fill="1" visible="no" active="no"/>
<layer number="90" name="Modules" color="5" fill="1" visible="yes" active="yes"/>
<layer number="91" name="Nets" color="2" fill="1" visible="yes" active="yes"/>
<layer number="92" name="Busses" color="1" fill="1" visible="yes" active="yes"/>
<layer number="93" name="Pins" color="2" fill="1" visible="no" active="yes"/>
<layer number="94" name="Symbols" color="4" fill="1" visible="yes" active="yes"/>
<layer number="95" name="Names" color="7" fill="1" visible="yes" active="yes"/>
<layer number="96" name="Values" color="7" fill="1" visible="yes" active="yes"/>
<layer number="97" name="Info" color="7" fill="1" visible="yes" active="yes"/>
<layer number="98" name="Guide" color="6" fill="1" visible="yes" active="yes"/>
</layers>
<schematic xreflabel="%F%N/%S.%C%R" xrefpart="/%S.%C%R">
<libraries>
<library name="teensypp">
<packages>
<package name="TEENSY++">
<description>teensy ++</description>
<wire x1="25.4" y1="8.89" x2="-25.4" y2="8.89" width="0.1524" layer="21"/>
<wire x1="-25.4" y1="-8.89" x2="25.4" y2="-8.89" width="0.1524" layer="21"/>
<wire x1="25.4" y1="8.89" x2="25.4" y2="6.35" width="0.1524" layer="21"/>
<wire x1="-25.4" y1="8.89" x2="-25.4" y2="6.35" width="0.1524" layer="21"/>
<wire x1="-25.4" y1="-8.89" x2="-25.4" y2="-6.35" width="0.1524" layer="21"/>
<wire x1="-25.4" y1="1.016" x2="-25.4" y2="-1.016" width="0.1524" layer="21" curve="-180"/>
<wire x1="-25.4" y1="6.35" x2="-25.4" y2="1.016" width="0.1524" layer="21"/>
<wire x1="25.4" y1="6.35" x2="25.4" y2="-6.35" width="0.1524" layer="21"/>
<wire x1="-25.4" y1="-6.35" x2="25.4" y2="-6.35" width="0.1524" layer="21"/>
<wire x1="-25.4" y1="-6.35" x2="-25.4" y2="-1.016" width="0.1524" layer="21"/>
<wire x1="25.4" y1="-6.35" x2="25.4" y2="-8.89" width="0.1524" layer="21"/>
<wire x1="-25.4" y1="6.35" x2="25.4" y2="6.35" width="0.1524" layer="21"/>
<pad name="GND" x="-24.13" y="-7.62" drill="1.016" diameter="1.8796" shape="square" rot="R90"/>
<pad name="B7" x="-21.59" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="D2" x="-13.97" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="D3" x="-11.43" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="D0" x="-19.05" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="D1" x="-16.51" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="D4" x="-8.89" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="D5" x="-6.35" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="D6" x="-3.81" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="D7" x="-1.27" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="E0" x="1.27" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="E1" x="3.81" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="C0" x="6.35" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="C1" x="8.89" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="C2" x="11.43" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="C3" x="13.97" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="C4" x="16.51" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="C5" x="19.05" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="C6" x="21.59" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="C7" x="24.13" y="-7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="F7" x="24.13" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="F6" x="21.59" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="F5" x="19.05" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="F4" x="16.51" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="F3" x="13.97" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="F2" x="11.43" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="F1" x="8.89" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="F0" x="6.35" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="REF" x="3.81" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="GRND1" x="1.27" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="E6" x="-1.27" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="E7" x="-3.81" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="B0" x="-6.35" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="B1" x="-8.89" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="B2" x="-11.43" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="B3" x="-13.97" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="B4" x="-16.51" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="B5" x="-19.05" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="B6" x="-21.59" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="+5V" x="-24.13" y="7.62" drill="1.016" diameter="1.8796" rot="R90"/>
<pad name="A4" x="8.89" y="2.54" drill="1.016" diameter="1.8796"/>
<pad name="A5" x="11.43" y="2.54" drill="1.016" diameter="1.8796"/>
<pad name="A6" x="13.97" y="2.54" drill="1.016" diameter="1.8796"/>
<pad name="A7" x="16.51" y="2.54" drill="1.016" diameter="1.8796"/>
<pad name="A3" x="16.51" y="0" drill="1.016" diameter="1.8796"/>
<pad name="A2" x="13.97" y="0" drill="1.016" diameter="1.8796"/>
<pad name="A1" x="11.43" y="0" drill="1.016" diameter="1.8796"/>
<pad name="A0" x="8.89" y="0" drill="1.016" diameter="1.8796"/>
<pad name="RST" x="24.13" y="2.54" drill="1.016" diameter="1.8796" shape="square"/>
<pad name="GND2" x="24.13" y="0" drill="1.016" diameter="1.8796"/>
<pad name="5V" x="24.13" y="-2.54" drill="1.016" diameter="1.8796"/>
<pad name="E4" x="-9.144" y="0.9144" drill="0.635" diameter="1.0668" rot="R180"/>
<pad name="E5" x="-9.144" y="-0.4064" drill="0.635" diameter="1.0668" rot="R180"/>
<text x="-22.225" y="-4.445" size="1.27" layer="27" ratio="10">&gt;VALUE</text>
<text x="-25.908" y="-8.255" size="1.27" layer="25" ratio="10" rot="R90">&gt;NAME</text>
<text x="-25.4" y="-11.43" size="1.27" layer="51" font="vector">Licensed Under Creative Commons </text>
<text x="-25.4" y="-16.51" size="1.27" layer="51" font="vector">Designed by Tamir Emran</text>
<text x="-25.4" y="-19.05" size="1.27" layer="51" font="vector">July 2011</text>
<text x="-25.4" y="-13.97" size="1.27" layer="51" font="vector">Attribution-ShareAlike 3.0 Uported License</text>
</package>
</packages>
<symbols>
<symbol name="ARDUNIO">
<wire x1="-22.86" y1="30.48" x2="17.78" y2="30.48" width="0.254" layer="94"/>
<wire x1="17.78" y1="30.48" x2="17.78" y2="-45.72" width="0.254" layer="94"/>
<wire x1="17.78" y1="-45.72" x2="-22.86" y2="-45.72" width="0.254" layer="94"/>
<wire x1="-22.86" y1="-45.72" x2="-22.86" y2="30.48" width="0.254" layer="94"/>
<text x="-20.32" y="33.02" size="1.778" layer="95" font="vector">&gt;NAME</text>
<text x="-2.54" y="-15.24" size="1.778" layer="96" font="vector" rot="R270">&gt;VALUE</text>
<text x="-7.62" y="-50.8" size="1.27" layer="97" font="vector">Teensy ++</text>
<text x="-35.56" y="-55.88" size="1.27" layer="97" font="vector">Licensed Under Creative Commons Attribution-ShareAlike 3.0 Unported</text>
<text x="-15.24" y="-60.96" size="1.27" layer="97" font="vector">Designed by Tamir Emran</text>
<text x="-7.62" y="-66.04" size="1.27" layer="97" font="vector">July 2011</text>
<pin name="GND" x="-27.94" y="27.94" length="middle" direction="pwr"/>
<pin name="27,PWM" x="-27.94" y="25.4" length="middle"/>
<pin name="0,PWM,INT0" x="-27.94" y="22.86" length="middle"/>
<pin name="1,PWM,INT1" x="-27.94" y="20.32" length="middle"/>
<pin name="2,RX,INT2" x="-27.94" y="17.78" length="middle"/>
<pin name="3,TX,INT3" x="-27.94" y="15.24" length="middle"/>
<pin name="4" x="-27.94" y="12.7" length="middle"/>
<pin name="5" x="-27.94" y="10.16" length="middle"/>
<pin name="6,LED" x="-27.94" y="7.62" length="middle"/>
<pin name="7" x="-27.94" y="5.08" length="middle"/>
<pin name="8" x="-27.94" y="2.54" length="middle"/>
<pin name="9" x="-27.94" y="0" length="middle"/>
<pin name="10" x="-27.94" y="-2.54" length="middle"/>
<pin name="11" x="-27.94" y="-5.08" length="middle"/>
<pin name="12" x="-27.94" y="-7.62" length="middle"/>
<pin name="13" x="-27.94" y="-10.16" length="middle"/>
<pin name="14,PWM" x="-27.94" y="-12.7" length="middle"/>
<pin name="15,PWM" x="-27.94" y="-15.24" length="middle"/>
<pin name="16,PWM" x="-27.94" y="-17.78" length="middle"/>
<pin name="17" x="-27.94" y="-20.32" length="middle"/>
<pin name="VCC" x="22.86" y="27.94" length="middle" direction="pwr" rot="R180"/>
<pin name="26,PWM" x="22.86" y="25.4" length="middle" rot="R180"/>
<pin name="25,PWM" x="22.86" y="22.86" length="middle" rot="R180"/>
<pin name="24,PWM" x="22.86" y="20.32" length="middle" rot="R180"/>
<pin name="23" x="22.86" y="17.78" length="middle" rot="R180"/>
<pin name="22" x="22.86" y="15.24" length="middle" rot="R180"/>
<pin name="21" x="22.86" y="12.7" length="middle" rot="R180"/>
<pin name="20" x="22.86" y="10.16" length="middle" rot="R180"/>
<pin name="19" x="22.86" y="7.62" length="middle" rot="R180"/>
<pin name="18,INT6" x="22.86" y="5.08" length="middle" rot="R180"/>
<pin name="GND@1" x="22.86" y="2.54" length="middle" direction="pwr" rot="R180"/>
<pin name="AREF" x="22.86" y="0" length="middle" direction="in" rot="R180"/>
<pin name="38,A0" x="22.86" y="-2.54" length="middle" rot="R180"/>
<pin name="39,A1" x="22.86" y="-5.08" length="middle" rot="R180"/>
<pin name="40,A2" x="22.86" y="-7.62" length="middle" rot="R180"/>
<pin name="41,A3" x="22.86" y="-10.16" length="middle" rot="R180"/>
<pin name="42,A4" x="22.86" y="-12.7" length="middle" rot="R180"/>
<pin name="43,A5" x="22.86" y="-15.24" length="middle" rot="R180"/>
<pin name="44,A6" x="22.86" y="-17.78" length="middle" rot="R180"/>
<pin name="45,A7" x="22.86" y="-20.32" length="middle" rot="R180"/>
<pin name="28" x="22.86" y="-25.4" length="middle" rot="R180"/>
<pin name="29" x="22.86" y="-27.94" length="middle" rot="R180"/>
<pin name="30" x="22.86" y="-30.48" length="middle" rot="R180"/>
<pin name="31" x="22.86" y="-33.02" length="middle" rot="R180"/>
<pin name="32" x="22.86" y="-35.56" length="middle" rot="R180"/>
<pin name="33" x="22.86" y="-38.1" length="middle" rot="R180"/>
<pin name="34" x="22.86" y="-40.64" length="middle" rot="R180"/>
<pin name="35" x="22.86" y="-43.18" length="middle" rot="R180"/>
<pin name="_RST" x="-27.94" y="-25.4" length="middle" direction="in"/>
<pin name="_GND2" x="-27.94" y="-27.94" length="middle" direction="pwr"/>
<pin name="+5V" x="-27.94" y="-30.48" length="middle" direction="pwr"/>
<pin name="36,INT4" x="-27.94" y="-35.56" length="middle"/>
<pin name="37,INT5" x="-27.94" y="-38.1" length="middle"/>
</symbol>
</symbols>
<devicesets>
<deviceset name="ARDUINO-TEENSY++">
<description>&lt;b&gt;Teensy ++&lt;/b&gt;&lt;br&gt;
Original Design by Mark Gross&lt;br&gt;
Modified Design by Tamir Emran&lt;br&gt;
Licensed Under Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)</description>
<gates>
<gate name="G$1" symbol="ARDUNIO" x="-2.54" y="15.24"/>
</gates>
<devices>
<device name="" package="TEENSY++">
<connects>
<connect gate="G$1" pin="+5V" pad="+5V"/>
<connect gate="G$1" pin="0,PWM,INT0" pad="D0"/>
<connect gate="G$1" pin="1,PWM,INT1" pad="D1"/>
<connect gate="G$1" pin="10" pad="C0"/>
<connect gate="G$1" pin="11" pad="C1"/>
<connect gate="G$1" pin="12" pad="C2"/>
<connect gate="G$1" pin="13" pad="C3"/>
<connect gate="G$1" pin="14,PWM" pad="C4"/>
<connect gate="G$1" pin="15,PWM" pad="C5"/>
<connect gate="G$1" pin="16,PWM" pad="C6"/>
<connect gate="G$1" pin="17" pad="C7"/>
<connect gate="G$1" pin="18,INT6" pad="E6"/>
<connect gate="G$1" pin="19" pad="E7"/>
<connect gate="G$1" pin="2,RX,INT2" pad="D2"/>
<connect gate="G$1" pin="20" pad="B0"/>
<connect gate="G$1" pin="21" pad="B1"/>
<connect gate="G$1" pin="22" pad="B2"/>
<connect gate="G$1" pin="23" pad="B3"/>
<connect gate="G$1" pin="24,PWM" pad="B4"/>
<connect gate="G$1" pin="25,PWM" pad="B5"/>
<connect gate="G$1" pin="26,PWM" pad="B6"/>
<connect gate="G$1" pin="27,PWM" pad="B7"/>
<connect gate="G$1" pin="28" pad="A0"/>
<connect gate="G$1" pin="29" pad="A1"/>
<connect gate="G$1" pin="3,TX,INT3" pad="D3"/>
<connect gate="G$1" pin="30" pad="A2"/>
<connect gate="G$1" pin="31" pad="A3"/>
<connect gate="G$1" pin="32" pad="A4"/>
<connect gate="G$1" pin="33" pad="A5"/>
<connect gate="G$1" pin="34" pad="A6"/>
<connect gate="G$1" pin="35" pad="A7"/>
<connect gate="G$1" pin="36,INT4" pad="E4"/>
<connect gate="G$1" pin="37,INT5" pad="E5"/>
<connect gate="G$1" pin="38,A0" pad="F0"/>
<connect gate="G$1" pin="39,A1" pad="F1"/>
<connect gate="G$1" pin="4" pad="D4"/>
<connect gate="G$1" pin="40,A2" pad="F2"/>
<connect gate="G$1" pin="41,A3" pad="F3"/>
<connect gate="G$1" pin="42,A4" pad="F4"/>
<connect gate="G$1" pin="43,A5" pad="F5"/>
<connect gate="G$1" pin="44,A6" pad="F6"/>
<connect gate="G$1" pin="45,A7" pad="F7"/>
<connect gate="G$1" pin="5" pad="D5"/>
<connect gate="G$1" pin="6,LED" pad="D6"/>
<connect gate="G$1" pin="7" pad="D7"/>
<connect gate="G$1" pin="8" pad="E0"/>
<connect gate="G$1" pin="9" pad="E1"/>
<connect gate="G$1" pin="AREF" pad="REF"/>
<connect gate="G$1" pin="GND" pad="GND"/>
<connect gate="G$1" pin="GND@1" pad="GRND1"/>
<connect gate="G$1" pin="VCC" pad="5V"/>
<connect gate="G$1" pin="_GND2" pad="GND2"/>
<connect gate="G$1" pin="_RST" pad="RST"/>
</connects>
<technologies>
<technology name=""/>
</technologies>
</device>
</devices>
</deviceset>
</devicesets>
</library>
<library name="con-molex">
<description>&lt;b&gt;Molex Connectors&lt;/b&gt;&lt;p&gt;
&lt;author&gt;Created by librarian@cadsoft.de&lt;/author&gt;</description>
<packages>
<package name="22-23-2031">
<description>.100" (2.54mm) Center Header - 3 Pin</description>
<wire x1="-3.81" y1="3.175" x2="3.81" y2="3.175" width="0.254" layer="21"/>
<wire x1="3.81" y1="3.175" x2="3.81" y2="1.27" width="0.254" layer="21"/>
<wire x1="3.81" y1="1.27" x2="3.81" y2="-3.175" width="0.254" layer="21"/>
<wire x1="3.81" y1="-3.175" x2="-3.81" y2="-3.175" width="0.254" layer="21"/>
<wire x1="-3.81" y1="-3.175" x2="-3.81" y2="1.27" width="0.254" layer="21"/>
<wire x1="-3.81" y1="1.27" x2="-3.81" y2="3.175" width="0.254" layer="21"/>
<wire x1="-3.81" y1="1.27" x2="3.81" y2="1.27" width="0.254" layer="21"/>
<pad name="1" x="-2.54" y="0" drill="1" shape="long" rot="R90"/>
<pad name="2" x="0" y="0" drill="1" shape="long" rot="R90"/>
<pad name="3" x="2.54" y="0" drill="1" shape="long" rot="R90"/>
<text x="-3.81" y="3.81" size="1.016" layer="25" ratio="10">&gt;NAME</text>
<text x="-3.81" y="-5.08" size="1.016" layer="27" ratio="10">&gt;VALUE</text>
</package>
</packages>
<symbols>
<symbol name="MV">
<wire x1="1.27" y1="0" x2="0" y2="0" width="0.6096" layer="94"/>
<text x="2.54" y="-0.762" size="1.524" layer="95">&gt;NAME</text>
<text x="-0.762" y="1.397" size="1.778" layer="96">&gt;VALUE</text>
<pin name="S" x="-2.54" y="0" visible="off" length="short" direction="pas"/>
</symbol>
<symbol name="M">
<wire x1="1.27" y1="0" x2="0" y2="0" width="0.6096" layer="94"/>
<text x="2.54" y="-0.762" size="1.524" layer="95">&gt;NAME</text>
<pin name="S" x="-2.54" y="0" visible="off" length="short" direction="pas"/>
</symbol>
</symbols>
<devicesets>
<deviceset name="22-23-2031" prefix="X">
<description>.100" (2.54mm) Center Header - 3 Pin</description>
<gates>
<gate name="-1" symbol="MV" x="0" y="2.54" addlevel="always" swaplevel="1"/>
<gate name="-2" symbol="M" x="0" y="0" addlevel="always" swaplevel="1"/>
<gate name="-3" symbol="M" x="0" y="-2.54" addlevel="always" swaplevel="1"/>
</gates>
<devices>
<device name="" package="22-23-2031">
<connects>
<connect gate="-1" pin="S" pad="1"/>
<connect gate="-2" pin="S" pad="2"/>
<connect gate="-3" pin="S" pad="3"/>
</connects>
<technologies>
<technology name="">
<attribute name="MF" value="MOLEX" constant="no"/>
<attribute name="MPN" value="22-23-2031" constant="no"/>
<attribute name="OC_FARNELL" value="1462950" constant="no"/>
<attribute name="OC_NEWARK" value="30C0862" constant="no"/>
</technology>
</technologies>
</device>
</devices>
</deviceset>
</devicesets>
</library>
<library name="supply1">
<description>&lt;b&gt;Supply Symbols&lt;/b&gt;&lt;p&gt;
 GND, VCC, 0V, +5V, -5V, etc.&lt;p&gt;
 Please keep in mind, that these devices are necessary for the
 automatic wiring of the supply signals.&lt;p&gt;
 The pin name defined in the symbol is identical to the net which is to be wired automatically.&lt;p&gt;
 In this library the device names are the same as the pin names of the symbols, therefore the correct signal names appear next to the supply symbols in the schematic.&lt;p&gt;
 &lt;author&gt;Created by librarian@cadsoft.de&lt;/author&gt;</description>
<packages>
</packages>
<symbols>
<symbol name="GND">
<wire x1="-1.905" y1="0" x2="1.905" y2="0" width="0.254" layer="94"/>
<text x="-2.54" y="-2.54" size="1.778" layer="96">&gt;VALUE</text>
<pin name="GND" x="0" y="2.54" visible="off" length="short" direction="sup" rot="R270"/>
</symbol>
<symbol name="VCC">
<wire x1="1.27" y1="-1.905" x2="0" y2="0" width="0.254" layer="94"/>
<wire x1="0" y1="0" x2="-1.27" y2="-1.905" width="0.254" layer="94"/>
<text x="-2.54" y="-2.54" size="1.778" layer="96" rot="R90">&gt;VALUE</text>
<pin name="VCC" x="0" y="-2.54" visible="off" length="short" direction="sup" rot="R90"/>
</symbol>
</symbols>
<devicesets>
<deviceset name="GND" prefix="GND">
<description>&lt;b&gt;SUPPLY SYMBOL&lt;/b&gt;</description>
<gates>
<gate name="1" symbol="GND" x="0" y="0"/>
</gates>
<devices>
<device name="">
<technologies>
<technology name=""/>
</technologies>
</device>
</devices>
</deviceset>
<deviceset name="VCC" prefix="P+">
<description>&lt;b&gt;SUPPLY SYMBOL&lt;/b&gt;</description>
<gates>
<gate name="VCC" symbol="VCC" x="0" y="0"/>
</gates>
<devices>
<device name="">
<technologies>
<technology name=""/>
</technologies>
</device>
</devices>
</deviceset>
</devicesets>
</library>
</libraries>
<attributes>
</attributes>
<variantdefs>
</variantdefs>
<classes>
<class number="0" name="default" width="0.3048" drill="0.508">
<clearance class="0" value="0.254"/>
</class>
</classes>
<parts>
<part name="U$1" library="teensypp" deviceset="ARDUINO-TEENSY++" device=""/>
<part name="B6" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="INT0/1" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND1" library="supply1" deviceset="GND" device=""/>
<part name="P+1" library="supply1" deviceset="VCC" device=""/>
<part name="P+2" library="supply1" deviceset="VCC" device=""/>
<part name="B5" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND3" library="supply1" deviceset="GND" device=""/>
<part name="P+4" library="supply1" deviceset="VCC" device=""/>
<part name="B4" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND2" library="supply1" deviceset="GND" device=""/>
<part name="P+3" library="supply1" deviceset="VCC" device=""/>
<part name="B3" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND4" library="supply1" deviceset="GND" device=""/>
<part name="P+5" library="supply1" deviceset="VCC" device=""/>
<part name="B2" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND5" library="supply1" deviceset="GND" device=""/>
<part name="P+6" library="supply1" deviceset="VCC" device=""/>
<part name="B1" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND6" library="supply1" deviceset="GND" device=""/>
<part name="P+7" library="supply1" deviceset="VCC" device=""/>
<part name="B0" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND7" library="supply1" deviceset="GND" device=""/>
<part name="P+8" library="supply1" deviceset="VCC" device=""/>
<part name="INT6/7" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND8" library="supply1" deviceset="GND" device=""/>
<part name="F0" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND10" library="supply1" deviceset="GND" device=""/>
<part name="P+11" library="supply1" deviceset="VCC" device=""/>
<part name="F1" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND11" library="supply1" deviceset="GND" device=""/>
<part name="P+12" library="supply1" deviceset="VCC" device=""/>
<part name="F2" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND12" library="supply1" deviceset="GND" device=""/>
<part name="P+13" library="supply1" deviceset="VCC" device=""/>
<part name="F3" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND13" library="supply1" deviceset="GND" device=""/>
<part name="P+14" library="supply1" deviceset="VCC" device=""/>
<part name="F4" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND14" library="supply1" deviceset="GND" device=""/>
<part name="P+15" library="supply1" deviceset="VCC" device=""/>
<part name="F5" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND15" library="supply1" deviceset="GND" device=""/>
<part name="P+16" library="supply1" deviceset="VCC" device=""/>
<part name="F6" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND16" library="supply1" deviceset="GND" device=""/>
<part name="P+17" library="supply1" deviceset="VCC" device=""/>
<part name="F7" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND17" library="supply1" deviceset="GND" device=""/>
<part name="P+18" library="supply1" deviceset="VCC" device=""/>
<part name="GND19" library="supply1" deviceset="GND" device=""/>
<part name="INT2/3" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND18" library="supply1" deviceset="GND" device=""/>
<part name="D4" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND20" library="supply1" deviceset="GND" device=""/>
<part name="P+19" library="supply1" deviceset="VCC" device=""/>
<part name="D5" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND21" library="supply1" deviceset="GND" device=""/>
<part name="P+20" library="supply1" deviceset="VCC" device=""/>
<part name="D6" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND9" library="supply1" deviceset="GND" device=""/>
<part name="P+9" library="supply1" deviceset="VCC" device=""/>
<part name="D7" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND22" library="supply1" deviceset="GND" device=""/>
<part name="P+10" library="supply1" deviceset="VCC" device=""/>
<part name="E0" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND23" library="supply1" deviceset="GND" device=""/>
<part name="P+21" library="supply1" deviceset="VCC" device=""/>
<part name="E1" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND24" library="supply1" deviceset="GND" device=""/>
<part name="P+22" library="supply1" deviceset="VCC" device=""/>
<part name="C0" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND25" library="supply1" deviceset="GND" device=""/>
<part name="P+23" library="supply1" deviceset="VCC" device=""/>
<part name="C1" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND26" library="supply1" deviceset="GND" device=""/>
<part name="P+24" library="supply1" deviceset="VCC" device=""/>
<part name="C2" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND27" library="supply1" deviceset="GND" device=""/>
<part name="P+25" library="supply1" deviceset="VCC" device=""/>
<part name="C3" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND28" library="supply1" deviceset="GND" device=""/>
<part name="P+26" library="supply1" deviceset="VCC" device=""/>
<part name="C4" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND29" library="supply1" deviceset="GND" device=""/>
<part name="P+27" library="supply1" deviceset="VCC" device=""/>
<part name="C5" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND30" library="supply1" deviceset="GND" device=""/>
<part name="P+28" library="supply1" deviceset="VCC" device=""/>
<part name="C6" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND31" library="supply1" deviceset="GND" device=""/>
<part name="P+29" library="supply1" deviceset="VCC" device=""/>
<part name="C7" library="con-molex" deviceset="22-23-2031" device=""/>
<part name="GND32" library="supply1" deviceset="GND" device=""/>
<part name="P+30" library="supply1" deviceset="VCC" device=""/>
<part name="GND33" library="supply1" deviceset="GND" device=""/>
</parts>
<sheets>
<sheet>
<plain>
</plain>
<instances>
<instance part="U$1" gate="G$1" x="139.7" y="203.2"/>
<instance part="B6" gate="-1" x="256.54" y="335.28"/>
<instance part="B6" gate="-2" x="256.54" y="332.74"/>
<instance part="B6" gate="-3" x="256.54" y="330.2"/>
<instance part="INT0/1" gate="-1" x="20.32" y="335.28" rot="MR0"/>
<instance part="INT0/1" gate="-2" x="20.32" y="332.74" rot="MR0"/>
<instance part="INT0/1" gate="-3" x="20.32" y="330.2" rot="MR0"/>
<instance part="GND1" gate="1" x="254" y="325.12"/>
<instance part="P+1" gate="VCC" x="254" y="340.36"/>
<instance part="P+2" gate="VCC" x="177.8" y="231.14" rot="R270"/>
<instance part="B5" gate="-1" x="256.54" y="314.96"/>
<instance part="B5" gate="-2" x="256.54" y="312.42"/>
<instance part="B5" gate="-3" x="256.54" y="309.88"/>
<instance part="GND3" gate="1" x="254" y="304.8"/>
<instance part="P+4" gate="VCC" x="254" y="320.04"/>
<instance part="B4" gate="-1" x="256.54" y="294.64"/>
<instance part="B4" gate="-2" x="256.54" y="292.1"/>
<instance part="B4" gate="-3" x="256.54" y="289.56"/>
<instance part="GND2" gate="1" x="254" y="284.48"/>
<instance part="P+3" gate="VCC" x="254" y="299.72"/>
<instance part="B3" gate="-1" x="256.54" y="274.32"/>
<instance part="B3" gate="-2" x="256.54" y="271.78"/>
<instance part="B3" gate="-3" x="256.54" y="269.24"/>
<instance part="GND4" gate="1" x="254" y="264.16"/>
<instance part="P+5" gate="VCC" x="254" y="279.4"/>
<instance part="B2" gate="-1" x="256.54" y="254"/>
<instance part="B2" gate="-2" x="256.54" y="251.46"/>
<instance part="B2" gate="-3" x="256.54" y="248.92"/>
<instance part="GND5" gate="1" x="254" y="243.84"/>
<instance part="P+6" gate="VCC" x="254" y="259.08"/>
<instance part="B1" gate="-1" x="256.54" y="233.68"/>
<instance part="B1" gate="-2" x="256.54" y="231.14"/>
<instance part="B1" gate="-3" x="256.54" y="228.6"/>
<instance part="GND6" gate="1" x="254" y="223.52"/>
<instance part="P+7" gate="VCC" x="254" y="238.76"/>
<instance part="B0" gate="-1" x="256.54" y="213.36"/>
<instance part="B0" gate="-2" x="256.54" y="210.82"/>
<instance part="B0" gate="-3" x="256.54" y="208.28"/>
<instance part="GND7" gate="1" x="254" y="203.2"/>
<instance part="P+8" gate="VCC" x="254" y="218.44"/>
<instance part="INT6/7" gate="-1" x="256.54" y="193.04"/>
<instance part="INT6/7" gate="-2" x="256.54" y="190.5"/>
<instance part="INT6/7" gate="-3" x="256.54" y="187.96"/>
<instance part="GND8" gate="1" x="248.92" y="190.5" rot="R270"/>
<instance part="F0" gate="-1" x="256.54" y="149.86"/>
<instance part="F0" gate="-2" x="256.54" y="147.32"/>
<instance part="F0" gate="-3" x="256.54" y="144.78"/>
<instance part="GND10" gate="1" x="254" y="139.7"/>
<instance part="P+11" gate="VCC" x="254" y="154.94"/>
<instance part="F1" gate="-1" x="256.54" y="129.54"/>
<instance part="F1" gate="-2" x="256.54" y="127"/>
<instance part="F1" gate="-3" x="256.54" y="124.46"/>
<instance part="GND11" gate="1" x="254" y="119.38"/>
<instance part="P+12" gate="VCC" x="254" y="134.62"/>
<instance part="F2" gate="-1" x="256.54" y="109.22"/>
<instance part="F2" gate="-2" x="256.54" y="106.68"/>
<instance part="F2" gate="-3" x="256.54" y="104.14"/>
<instance part="GND12" gate="1" x="254" y="99.06"/>
<instance part="P+13" gate="VCC" x="254" y="114.3"/>
<instance part="F3" gate="-1" x="256.54" y="88.9"/>
<instance part="F3" gate="-2" x="256.54" y="86.36"/>
<instance part="F3" gate="-3" x="256.54" y="83.82"/>
<instance part="GND13" gate="1" x="254" y="78.74"/>
<instance part="P+14" gate="VCC" x="254" y="93.98"/>
<instance part="F4" gate="-1" x="256.54" y="68.58"/>
<instance part="F4" gate="-2" x="256.54" y="66.04"/>
<instance part="F4" gate="-3" x="256.54" y="63.5"/>
<instance part="GND14" gate="1" x="254" y="58.42"/>
<instance part="P+15" gate="VCC" x="254" y="73.66"/>
<instance part="F5" gate="-1" x="256.54" y="48.26"/>
<instance part="F5" gate="-2" x="256.54" y="45.72"/>
<instance part="F5" gate="-3" x="256.54" y="43.18"/>
<instance part="GND15" gate="1" x="254" y="38.1"/>
<instance part="P+16" gate="VCC" x="254" y="53.34"/>
<instance part="F6" gate="-1" x="256.54" y="27.94"/>
<instance part="F6" gate="-2" x="256.54" y="25.4"/>
<instance part="F6" gate="-3" x="256.54" y="22.86"/>
<instance part="GND16" gate="1" x="254" y="17.78"/>
<instance part="P+17" gate="VCC" x="254" y="33.02"/>
<instance part="F7" gate="-1" x="256.54" y="7.62"/>
<instance part="F7" gate="-2" x="256.54" y="5.08"/>
<instance part="F7" gate="-3" x="256.54" y="2.54"/>
<instance part="GND17" gate="1" x="254" y="-2.54"/>
<instance part="P+18" gate="VCC" x="254" y="12.7"/>
<instance part="GND19" gate="1" x="30.48" y="332.74" rot="R90"/>
<instance part="INT2/3" gate="-1" x="20.32" y="325.12" rot="MR0"/>
<instance part="INT2/3" gate="-2" x="20.32" y="322.58" rot="MR0"/>
<instance part="INT2/3" gate="-3" x="20.32" y="320.04" rot="MR0"/>
<instance part="GND18" gate="1" x="30.48" y="322.58" rot="R90"/>
<instance part="D4" gate="-1" x="17.78" y="309.88" rot="MR0"/>
<instance part="D4" gate="-2" x="17.78" y="307.34" rot="MR0"/>
<instance part="D4" gate="-3" x="17.78" y="304.8" rot="MR0"/>
<instance part="GND20" gate="1" x="20.32" y="299.72"/>
<instance part="P+19" gate="VCC" x="20.32" y="314.96"/>
<instance part="D5" gate="-1" x="17.78" y="287.02" rot="MR0"/>
<instance part="D5" gate="-2" x="17.78" y="284.48" rot="MR0"/>
<instance part="D5" gate="-3" x="17.78" y="281.94" rot="MR0"/>
<instance part="GND21" gate="1" x="20.32" y="276.86"/>
<instance part="P+20" gate="VCC" x="20.32" y="292.1"/>
<instance part="D6" gate="-1" x="17.78" y="264.16" rot="MR0"/>
<instance part="D6" gate="-2" x="17.78" y="261.62" rot="MR0"/>
<instance part="D6" gate="-3" x="17.78" y="259.08" rot="MR0"/>
<instance part="GND9" gate="1" x="20.32" y="254"/>
<instance part="P+9" gate="VCC" x="20.32" y="269.24"/>
<instance part="D7" gate="-1" x="17.78" y="241.3" rot="MR0"/>
<instance part="D7" gate="-2" x="17.78" y="238.76" rot="MR0"/>
<instance part="D7" gate="-3" x="17.78" y="236.22" rot="MR0"/>
<instance part="GND22" gate="1" x="20.32" y="231.14"/>
<instance part="P+10" gate="VCC" x="20.32" y="246.38"/>
<instance part="E0" gate="-1" x="17.78" y="220.98" rot="MR0"/>
<instance part="E0" gate="-2" x="17.78" y="218.44" rot="MR0"/>
<instance part="E0" gate="-3" x="17.78" y="215.9" rot="MR0"/>
<instance part="GND23" gate="1" x="20.32" y="210.82"/>
<instance part="P+21" gate="VCC" x="20.32" y="226.06"/>
<instance part="E1" gate="-1" x="17.78" y="198.12" rot="MR0"/>
<instance part="E1" gate="-2" x="17.78" y="195.58" rot="MR0"/>
<instance part="E1" gate="-3" x="17.78" y="193.04" rot="MR0"/>
<instance part="GND24" gate="1" x="20.32" y="187.96"/>
<instance part="P+22" gate="VCC" x="20.32" y="203.2"/>
<instance part="C0" gate="-1" x="17.78" y="175.26" rot="MR0"/>
<instance part="C0" gate="-2" x="17.78" y="172.72" rot="MR0"/>
<instance part="C0" gate="-3" x="17.78" y="170.18" rot="MR0"/>
<instance part="GND25" gate="1" x="20.32" y="165.1"/>
<instance part="P+23" gate="VCC" x="20.32" y="180.34"/>
<instance part="C1" gate="-1" x="17.78" y="152.4" rot="MR0"/>
<instance part="C1" gate="-2" x="17.78" y="149.86" rot="MR0"/>
<instance part="C1" gate="-3" x="17.78" y="147.32" rot="MR0"/>
<instance part="GND26" gate="1" x="20.32" y="142.24"/>
<instance part="P+24" gate="VCC" x="20.32" y="157.48"/>
<instance part="C2" gate="-1" x="17.78" y="129.54" rot="MR0"/>
<instance part="C2" gate="-2" x="17.78" y="127" rot="MR0"/>
<instance part="C2" gate="-3" x="17.78" y="124.46" rot="MR0"/>
<instance part="GND27" gate="1" x="20.32" y="119.38"/>
<instance part="P+25" gate="VCC" x="20.32" y="134.62"/>
<instance part="C3" gate="-1" x="17.78" y="106.68" rot="MR0"/>
<instance part="C3" gate="-2" x="17.78" y="104.14" rot="MR0"/>
<instance part="C3" gate="-3" x="17.78" y="101.6" rot="MR0"/>
<instance part="GND28" gate="1" x="20.32" y="96.52"/>
<instance part="P+26" gate="VCC" x="20.32" y="111.76"/>
<instance part="C4" gate="-1" x="17.78" y="86.36" rot="MR0"/>
<instance part="C4" gate="-2" x="17.78" y="83.82" rot="MR0"/>
<instance part="C4" gate="-3" x="17.78" y="81.28" rot="MR0"/>
<instance part="GND29" gate="1" x="20.32" y="76.2"/>
<instance part="P+27" gate="VCC" x="20.32" y="91.44"/>
<instance part="C5" gate="-1" x="17.78" y="63.5" rot="MR0"/>
<instance part="C5" gate="-2" x="17.78" y="60.96" rot="MR0"/>
<instance part="C5" gate="-3" x="17.78" y="58.42" rot="MR0"/>
<instance part="GND30" gate="1" x="20.32" y="53.34"/>
<instance part="P+28" gate="VCC" x="20.32" y="68.58"/>
<instance part="C6" gate="-1" x="17.78" y="40.64" rot="MR0"/>
<instance part="C6" gate="-2" x="17.78" y="38.1" rot="MR0"/>
<instance part="C6" gate="-3" x="17.78" y="35.56" rot="MR0"/>
<instance part="GND31" gate="1" x="20.32" y="30.48"/>
<instance part="P+29" gate="VCC" x="20.32" y="45.72"/>
<instance part="C7" gate="-1" x="17.78" y="17.78" rot="MR0"/>
<instance part="C7" gate="-2" x="17.78" y="15.24" rot="MR0"/>
<instance part="C7" gate="-3" x="17.78" y="12.7" rot="MR0"/>
<instance part="GND32" gate="1" x="20.32" y="7.62"/>
<instance part="P+30" gate="VCC" x="20.32" y="22.86"/>
<instance part="GND33" gate="1" x="109.22" y="238.76" rot="R180"/>
</instances>
<busses>
</busses>
<nets>
<net name="VCC" class="0">
<segment>
<pinref part="P+1" gate="VCC" pin="VCC"/>
<pinref part="B6" gate="-1" pin="S"/>
<wire x1="254" y1="337.82" x2="254" y2="340.36" width="0.1524" layer="91"/>
<wire x1="254" y1="337.82" x2="254" y2="335.28" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+2" gate="VCC" pin="VCC"/>
<pinref part="U$1" gate="G$1" pin="VCC"/>
<wire x1="175.26" y1="231.14" x2="162.56" y2="231.14" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+4" gate="VCC" pin="VCC"/>
<pinref part="B5" gate="-1" pin="S"/>
<wire x1="254" y1="317.5" x2="254" y2="320.04" width="0.1524" layer="91"/>
<wire x1="254" y1="317.5" x2="254" y2="314.96" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+3" gate="VCC" pin="VCC"/>
<pinref part="B4" gate="-1" pin="S"/>
<wire x1="254" y1="297.18" x2="254" y2="299.72" width="0.1524" layer="91"/>
<wire x1="254" y1="297.18" x2="254" y2="294.64" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+5" gate="VCC" pin="VCC"/>
<pinref part="B3" gate="-1" pin="S"/>
<wire x1="254" y1="276.86" x2="254" y2="279.4" width="0.1524" layer="91"/>
<wire x1="254" y1="274.32" x2="254" y2="276.86" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+6" gate="VCC" pin="VCC"/>
<pinref part="B2" gate="-1" pin="S"/>
<wire x1="254" y1="256.54" x2="254" y2="259.08" width="0.1524" layer="91"/>
<wire x1="254" y1="256.54" x2="254" y2="254" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+7" gate="VCC" pin="VCC"/>
<pinref part="B1" gate="-1" pin="S"/>
<wire x1="254" y1="236.22" x2="254" y2="238.76" width="0.1524" layer="91"/>
<wire x1="254" y1="236.22" x2="254" y2="233.68" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+8" gate="VCC" pin="VCC"/>
<pinref part="B0" gate="-1" pin="S"/>
<wire x1="254" y1="215.9" x2="254" y2="218.44" width="0.1524" layer="91"/>
<wire x1="254" y1="215.9" x2="254" y2="213.36" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+11" gate="VCC" pin="VCC"/>
<pinref part="F0" gate="-1" pin="S"/>
<wire x1="254" y1="152.4" x2="254" y2="154.94" width="0.1524" layer="91"/>
<wire x1="254" y1="152.4" x2="254" y2="149.86" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+12" gate="VCC" pin="VCC"/>
<pinref part="F1" gate="-1" pin="S"/>
<wire x1="254" y1="132.08" x2="254" y2="134.62" width="0.1524" layer="91"/>
<wire x1="254" y1="132.08" x2="254" y2="129.54" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+13" gate="VCC" pin="VCC"/>
<pinref part="F2" gate="-1" pin="S"/>
<wire x1="254" y1="111.76" x2="254" y2="114.3" width="0.1524" layer="91"/>
<wire x1="254" y1="111.76" x2="254" y2="109.22" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+14" gate="VCC" pin="VCC"/>
<pinref part="F3" gate="-1" pin="S"/>
<wire x1="254" y1="91.44" x2="254" y2="93.98" width="0.1524" layer="91"/>
<wire x1="254" y1="91.44" x2="254" y2="88.9" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+15" gate="VCC" pin="VCC"/>
<pinref part="F4" gate="-1" pin="S"/>
<wire x1="254" y1="71.12" x2="254" y2="73.66" width="0.1524" layer="91"/>
<wire x1="254" y1="71.12" x2="254" y2="68.58" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+16" gate="VCC" pin="VCC"/>
<pinref part="F5" gate="-1" pin="S"/>
<wire x1="254" y1="50.8" x2="254" y2="53.34" width="0.1524" layer="91"/>
<wire x1="254" y1="50.8" x2="254" y2="48.26" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+17" gate="VCC" pin="VCC"/>
<pinref part="F6" gate="-1" pin="S"/>
<wire x1="254" y1="30.48" x2="254" y2="33.02" width="0.1524" layer="91"/>
<wire x1="254" y1="30.48" x2="254" y2="27.94" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+18" gate="VCC" pin="VCC"/>
<pinref part="F7" gate="-1" pin="S"/>
<wire x1="254" y1="10.16" x2="254" y2="12.7" width="0.1524" layer="91"/>
<wire x1="254" y1="10.16" x2="254" y2="7.62" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+19" gate="VCC" pin="VCC"/>
<pinref part="D4" gate="-1" pin="S"/>
<wire x1="20.32" y1="312.42" x2="20.32" y2="309.88" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+20" gate="VCC" pin="VCC"/>
<pinref part="D5" gate="-1" pin="S"/>
<wire x1="20.32" y1="289.56" x2="20.32" y2="287.02" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+9" gate="VCC" pin="VCC"/>
<pinref part="D6" gate="-1" pin="S"/>
<wire x1="20.32" y1="266.7" x2="20.32" y2="264.16" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+10" gate="VCC" pin="VCC"/>
<pinref part="D7" gate="-1" pin="S"/>
<wire x1="20.32" y1="243.84" x2="20.32" y2="241.3" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+21" gate="VCC" pin="VCC"/>
<pinref part="E0" gate="-1" pin="S"/>
<wire x1="20.32" y1="223.52" x2="20.32" y2="220.98" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+22" gate="VCC" pin="VCC"/>
<pinref part="E1" gate="-1" pin="S"/>
<wire x1="20.32" y1="200.66" x2="20.32" y2="198.12" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+23" gate="VCC" pin="VCC"/>
<pinref part="C0" gate="-1" pin="S"/>
<wire x1="20.32" y1="177.8" x2="20.32" y2="175.26" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+24" gate="VCC" pin="VCC"/>
<pinref part="C1" gate="-1" pin="S"/>
<wire x1="20.32" y1="154.94" x2="20.32" y2="152.4" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+25" gate="VCC" pin="VCC"/>
<pinref part="C2" gate="-1" pin="S"/>
<wire x1="20.32" y1="132.08" x2="20.32" y2="129.54" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+26" gate="VCC" pin="VCC"/>
<pinref part="C3" gate="-1" pin="S"/>
<wire x1="20.32" y1="109.22" x2="20.32" y2="106.68" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+27" gate="VCC" pin="VCC"/>
<pinref part="C4" gate="-1" pin="S"/>
<wire x1="20.32" y1="88.9" x2="20.32" y2="86.36" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+28" gate="VCC" pin="VCC"/>
<pinref part="C5" gate="-1" pin="S"/>
<wire x1="20.32" y1="66.04" x2="20.32" y2="63.5" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+29" gate="VCC" pin="VCC"/>
<pinref part="C6" gate="-1" pin="S"/>
<wire x1="20.32" y1="43.18" x2="20.32" y2="40.64" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="P+30" gate="VCC" pin="VCC"/>
<pinref part="C7" gate="-1" pin="S"/>
<wire x1="20.32" y1="20.32" x2="20.32" y2="17.78" width="0.1524" layer="91"/>
</segment>
</net>
<net name="GND" class="0">
<segment>
<pinref part="B6" gate="-3" pin="S"/>
<pinref part="GND1" gate="1" pin="GND"/>
<wire x1="254" y1="330.2" x2="254" y2="327.66" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="B5" gate="-3" pin="S"/>
<pinref part="GND3" gate="1" pin="GND"/>
<wire x1="254" y1="309.88" x2="254" y2="307.34" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="B4" gate="-3" pin="S"/>
<pinref part="GND2" gate="1" pin="GND"/>
<wire x1="254" y1="289.56" x2="254" y2="287.02" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="B3" gate="-3" pin="S"/>
<pinref part="GND4" gate="1" pin="GND"/>
<wire x1="254" y1="269.24" x2="254" y2="266.7" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="B2" gate="-3" pin="S"/>
<pinref part="GND5" gate="1" pin="GND"/>
<wire x1="254" y1="248.92" x2="254" y2="246.38" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="B1" gate="-3" pin="S"/>
<pinref part="GND6" gate="1" pin="GND"/>
<wire x1="254" y1="228.6" x2="254" y2="226.06" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="B0" gate="-3" pin="S"/>
<pinref part="GND7" gate="1" pin="GND"/>
<wire x1="254" y1="208.28" x2="254" y2="205.74" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="F0" gate="-3" pin="S"/>
<pinref part="GND10" gate="1" pin="GND"/>
<wire x1="254" y1="144.78" x2="254" y2="142.24" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="F1" gate="-3" pin="S"/>
<pinref part="GND11" gate="1" pin="GND"/>
<wire x1="254" y1="124.46" x2="254" y2="121.92" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="F2" gate="-3" pin="S"/>
<pinref part="GND12" gate="1" pin="GND"/>
<wire x1="254" y1="104.14" x2="254" y2="101.6" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="F3" gate="-3" pin="S"/>
<pinref part="GND13" gate="1" pin="GND"/>
<wire x1="254" y1="83.82" x2="254" y2="81.28" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="F4" gate="-3" pin="S"/>
<pinref part="GND14" gate="1" pin="GND"/>
<wire x1="254" y1="63.5" x2="254" y2="60.96" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="F5" gate="-3" pin="S"/>
<pinref part="GND15" gate="1" pin="GND"/>
<wire x1="254" y1="43.18" x2="254" y2="40.64" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="F6" gate="-3" pin="S"/>
<pinref part="GND16" gate="1" pin="GND"/>
<wire x1="254" y1="22.86" x2="254" y2="20.32" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="F7" gate="-3" pin="S"/>
<pinref part="GND17" gate="1" pin="GND"/>
<wire x1="254" y1="2.54" x2="254" y2="0" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="GND19" gate="1" pin="GND"/>
<pinref part="INT0/1" gate="-2" pin="S"/>
<wire x1="27.94" y1="332.74" x2="22.86" y2="332.74" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="GND18" gate="1" pin="GND"/>
<pinref part="INT2/3" gate="-2" pin="S"/>
<wire x1="27.94" y1="322.58" x2="22.86" y2="322.58" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="D4" gate="-3" pin="S"/>
<pinref part="GND20" gate="1" pin="GND"/>
<wire x1="20.32" y1="304.8" x2="20.32" y2="302.26" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="D5" gate="-3" pin="S"/>
<pinref part="GND21" gate="1" pin="GND"/>
<wire x1="20.32" y1="281.94" x2="20.32" y2="279.4" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="INT6/7" gate="-2" pin="S"/>
<pinref part="GND8" gate="1" pin="GND"/>
<wire x1="254" y1="190.5" x2="251.46" y2="190.5" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="D6" gate="-3" pin="S"/>
<pinref part="GND9" gate="1" pin="GND"/>
<wire x1="20.32" y1="259.08" x2="20.32" y2="256.54" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="D7" gate="-3" pin="S"/>
<pinref part="GND22" gate="1" pin="GND"/>
<wire x1="20.32" y1="236.22" x2="20.32" y2="233.68" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="E0" gate="-3" pin="S"/>
<pinref part="GND23" gate="1" pin="GND"/>
<wire x1="20.32" y1="215.9" x2="20.32" y2="213.36" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="E1" gate="-3" pin="S"/>
<pinref part="GND24" gate="1" pin="GND"/>
<wire x1="20.32" y1="193.04" x2="20.32" y2="190.5" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="C0" gate="-3" pin="S"/>
<pinref part="GND25" gate="1" pin="GND"/>
<wire x1="20.32" y1="170.18" x2="20.32" y2="167.64" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="C1" gate="-3" pin="S"/>
<pinref part="GND26" gate="1" pin="GND"/>
<wire x1="20.32" y1="147.32" x2="20.32" y2="144.78" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="C2" gate="-3" pin="S"/>
<pinref part="GND27" gate="1" pin="GND"/>
<wire x1="20.32" y1="124.46" x2="20.32" y2="121.92" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="C3" gate="-3" pin="S"/>
<pinref part="GND28" gate="1" pin="GND"/>
<wire x1="20.32" y1="101.6" x2="20.32" y2="99.06" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="C4" gate="-3" pin="S"/>
<pinref part="GND29" gate="1" pin="GND"/>
<wire x1="20.32" y1="81.28" x2="20.32" y2="78.74" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="C5" gate="-3" pin="S"/>
<pinref part="GND30" gate="1" pin="GND"/>
<wire x1="20.32" y1="58.42" x2="20.32" y2="55.88" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="C6" gate="-3" pin="S"/>
<pinref part="GND31" gate="1" pin="GND"/>
<wire x1="20.32" y1="35.56" x2="20.32" y2="33.02" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="C7" gate="-3" pin="S"/>
<pinref part="GND32" gate="1" pin="GND"/>
<wire x1="20.32" y1="12.7" x2="20.32" y2="10.16" width="0.1524" layer="91"/>
</segment>
<segment>
<pinref part="U$1" gate="G$1" pin="GND"/>
<pinref part="GND33" gate="1" pin="GND"/>
<wire x1="111.76" y1="231.14" x2="109.22" y2="231.14" width="0.1524" layer="91"/>
<wire x1="109.22" y1="231.14" x2="109.22" y2="236.22" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$1" class="0">
<segment>
<pinref part="U$1" gate="G$1" pin="26,PWM"/>
<wire x1="162.56" y1="228.6" x2="182.88" y2="228.6" width="0.1524" layer="91"/>
<wire x1="182.88" y1="228.6" x2="182.88" y2="332.74" width="0.1524" layer="91"/>
<pinref part="B6" gate="-2" pin="S"/>
<wire x1="182.88" y1="332.74" x2="254" y2="332.74" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$2" class="0">
<segment>
<pinref part="B5" gate="-2" pin="S"/>
<wire x1="254" y1="312.42" x2="185.42" y2="312.42" width="0.1524" layer="91"/>
<wire x1="185.42" y1="312.42" x2="185.42" y2="226.06" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="25,PWM"/>
<wire x1="185.42" y1="226.06" x2="162.56" y2="226.06" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$3" class="0">
<segment>
<pinref part="B4" gate="-2" pin="S"/>
<wire x1="254" y1="292.1" x2="187.96" y2="292.1" width="0.1524" layer="91"/>
<wire x1="187.96" y1="292.1" x2="187.96" y2="223.52" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="24,PWM"/>
<wire x1="187.96" y1="223.52" x2="162.56" y2="223.52" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$4" class="0">
<segment>
<pinref part="B3" gate="-2" pin="S"/>
<wire x1="254" y1="271.78" x2="190.5" y2="271.78" width="0.1524" layer="91"/>
<wire x1="190.5" y1="271.78" x2="190.5" y2="220.98" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="23"/>
<wire x1="190.5" y1="220.98" x2="162.56" y2="220.98" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$5" class="0">
<segment>
<pinref part="B2" gate="-2" pin="S"/>
<wire x1="254" y1="251.46" x2="193.04" y2="251.46" width="0.1524" layer="91"/>
<wire x1="193.04" y1="251.46" x2="193.04" y2="218.44" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="22"/>
<wire x1="193.04" y1="218.44" x2="162.56" y2="218.44" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$6" class="0">
<segment>
<pinref part="B1" gate="-2" pin="S"/>
<wire x1="254" y1="231.14" x2="195.58" y2="231.14" width="0.1524" layer="91"/>
<wire x1="195.58" y1="231.14" x2="195.58" y2="215.9" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="21"/>
<wire x1="195.58" y1="215.9" x2="162.56" y2="215.9" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$7" class="0">
<segment>
<pinref part="B0" gate="-2" pin="S"/>
<wire x1="254" y1="210.82" x2="195.58" y2="210.82" width="0.1524" layer="91"/>
<wire x1="195.58" y1="210.82" x2="195.58" y2="213.36" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="20"/>
<wire x1="195.58" y1="213.36" x2="162.56" y2="213.36" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$10" class="0">
<segment>
<pinref part="F0" gate="-2" pin="S"/>
<wire x1="254" y1="147.32" x2="187.96" y2="147.32" width="0.1524" layer="91"/>
<wire x1="187.96" y1="147.32" x2="187.96" y2="200.66" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="38,A0"/>
<wire x1="187.96" y1="200.66" x2="162.56" y2="200.66" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$11" class="0">
<segment>
<pinref part="F1" gate="-2" pin="S"/>
<wire x1="254" y1="127" x2="185.42" y2="127" width="0.1524" layer="91"/>
<wire x1="185.42" y1="127" x2="185.42" y2="198.12" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="39,A1"/>
<wire x1="185.42" y1="198.12" x2="162.56" y2="198.12" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$12" class="0">
<segment>
<pinref part="F2" gate="-2" pin="S"/>
<wire x1="254" y1="106.68" x2="182.88" y2="106.68" width="0.1524" layer="91"/>
<wire x1="182.88" y1="106.68" x2="182.88" y2="195.58" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="40,A2"/>
<wire x1="182.88" y1="195.58" x2="162.56" y2="195.58" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$13" class="0">
<segment>
<pinref part="F3" gate="-2" pin="S"/>
<wire x1="254" y1="86.36" x2="180.34" y2="86.36" width="0.1524" layer="91"/>
<wire x1="180.34" y1="86.36" x2="180.34" y2="193.04" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="41,A3"/>
<wire x1="180.34" y1="193.04" x2="162.56" y2="193.04" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$14" class="0">
<segment>
<pinref part="F4" gate="-2" pin="S"/>
<wire x1="254" y1="66.04" x2="177.8" y2="66.04" width="0.1524" layer="91"/>
<wire x1="177.8" y1="66.04" x2="177.8" y2="190.5" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="42,A4"/>
<wire x1="177.8" y1="190.5" x2="162.56" y2="190.5" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$15" class="0">
<segment>
<pinref part="F5" gate="-2" pin="S"/>
<wire x1="254" y1="45.72" x2="175.26" y2="45.72" width="0.1524" layer="91"/>
<wire x1="175.26" y1="45.72" x2="175.26" y2="187.96" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="43,A5"/>
<wire x1="175.26" y1="187.96" x2="162.56" y2="187.96" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$16" class="0">
<segment>
<pinref part="F6" gate="-2" pin="S"/>
<wire x1="254" y1="25.4" x2="172.72" y2="25.4" width="0.1524" layer="91"/>
<wire x1="172.72" y1="25.4" x2="172.72" y2="185.42" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="44,A6"/>
<wire x1="172.72" y1="185.42" x2="162.56" y2="185.42" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$17" class="0">
<segment>
<pinref part="F7" gate="-2" pin="S"/>
<wire x1="254" y1="5.08" x2="170.18" y2="5.08" width="0.1524" layer="91"/>
<wire x1="170.18" y1="5.08" x2="170.18" y2="182.88" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="45,A7"/>
<wire x1="170.18" y1="182.88" x2="162.56" y2="182.88" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$8" class="0">
<segment>
<pinref part="INT6/7" gate="-1" pin="S"/>
<wire x1="254" y1="193.04" x2="193.04" y2="193.04" width="0.1524" layer="91"/>
<wire x1="193.04" y1="193.04" x2="193.04" y2="210.82" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="19"/>
<wire x1="193.04" y1="210.82" x2="162.56" y2="210.82" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$9" class="0">
<segment>
<pinref part="INT6/7" gate="-3" pin="S"/>
<wire x1="254" y1="187.96" x2="190.5" y2="187.96" width="0.1524" layer="91"/>
<wire x1="190.5" y1="187.96" x2="190.5" y2="208.28" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="18,INT6"/>
<wire x1="190.5" y1="208.28" x2="162.56" y2="208.28" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$18" class="0">
<segment>
<pinref part="INT0/1" gate="-1" pin="S"/>
<wire x1="22.86" y1="335.28" x2="101.6" y2="335.28" width="0.1524" layer="91"/>
<wire x1="101.6" y1="335.28" x2="101.6" y2="226.06" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="0,PWM,INT0"/>
<wire x1="101.6" y1="226.06" x2="111.76" y2="226.06" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$19" class="0">
<segment>
<pinref part="U$1" gate="G$1" pin="1,PWM,INT1"/>
<wire x1="111.76" y1="223.52" x2="99.06" y2="223.52" width="0.1524" layer="91"/>
<wire x1="99.06" y1="223.52" x2="99.06" y2="330.2" width="0.1524" layer="91"/>
<pinref part="INT0/1" gate="-3" pin="S"/>
<wire x1="99.06" y1="330.2" x2="22.86" y2="330.2" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$20" class="0">
<segment>
<pinref part="INT2/3" gate="-1" pin="S"/>
<wire x1="22.86" y1="325.12" x2="96.52" y2="325.12" width="0.1524" layer="91"/>
<wire x1="96.52" y1="325.12" x2="96.52" y2="220.98" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="2,RX,INT2"/>
<wire x1="96.52" y1="220.98" x2="111.76" y2="220.98" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$21" class="0">
<segment>
<pinref part="INT2/3" gate="-3" pin="S"/>
<wire x1="22.86" y1="320.04" x2="93.98" y2="320.04" width="0.1524" layer="91"/>
<wire x1="93.98" y1="320.04" x2="93.98" y2="218.44" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="3,TX,INT3"/>
<wire x1="93.98" y1="218.44" x2="111.76" y2="218.44" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$22" class="0">
<segment>
<pinref part="U$1" gate="G$1" pin="4"/>
<wire x1="111.76" y1="215.9" x2="91.44" y2="215.9" width="0.1524" layer="91"/>
<wire x1="91.44" y1="215.9" x2="91.44" y2="307.34" width="0.1524" layer="91"/>
<pinref part="D4" gate="-2" pin="S"/>
<wire x1="91.44" y1="307.34" x2="20.32" y2="307.34" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$23" class="0">
<segment>
<pinref part="D5" gate="-2" pin="S"/>
<wire x1="20.32" y1="284.48" x2="88.9" y2="284.48" width="0.1524" layer="91"/>
<wire x1="88.9" y1="284.48" x2="88.9" y2="213.36" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="5"/>
<wire x1="88.9" y1="213.36" x2="111.76" y2="213.36" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$24" class="0">
<segment>
<pinref part="D6" gate="-2" pin="S"/>
<wire x1="20.32" y1="261.62" x2="86.36" y2="261.62" width="0.1524" layer="91"/>
<wire x1="86.36" y1="261.62" x2="86.36" y2="210.82" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="6,LED"/>
<wire x1="86.36" y1="210.82" x2="111.76" y2="210.82" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$25" class="0">
<segment>
<pinref part="D7" gate="-2" pin="S"/>
<wire x1="20.32" y1="238.76" x2="83.82" y2="238.76" width="0.1524" layer="91"/>
<wire x1="83.82" y1="238.76" x2="83.82" y2="208.28" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="7"/>
<wire x1="83.82" y1="208.28" x2="111.76" y2="208.28" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$26" class="0">
<segment>
<pinref part="E0" gate="-2" pin="S"/>
<wire x1="20.32" y1="218.44" x2="81.28" y2="218.44" width="0.1524" layer="91"/>
<wire x1="81.28" y1="218.44" x2="81.28" y2="205.74" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="8"/>
<wire x1="81.28" y1="205.74" x2="111.76" y2="205.74" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$27" class="0">
<segment>
<pinref part="E1" gate="-2" pin="S"/>
<wire x1="20.32" y1="195.58" x2="81.28" y2="195.58" width="0.1524" layer="91"/>
<wire x1="81.28" y1="195.58" x2="81.28" y2="203.2" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="9"/>
<wire x1="81.28" y1="203.2" x2="111.76" y2="203.2" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$28" class="0">
<segment>
<pinref part="C0" gate="-2" pin="S"/>
<wire x1="20.32" y1="172.72" x2="83.82" y2="172.72" width="0.1524" layer="91"/>
<wire x1="83.82" y1="172.72" x2="83.82" y2="200.66" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="10"/>
<wire x1="83.82" y1="200.66" x2="111.76" y2="200.66" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$29" class="0">
<segment>
<pinref part="C1" gate="-2" pin="S"/>
<wire x1="20.32" y1="149.86" x2="86.36" y2="149.86" width="0.1524" layer="91"/>
<wire x1="86.36" y1="149.86" x2="86.36" y2="198.12" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="11"/>
<wire x1="86.36" y1="198.12" x2="111.76" y2="198.12" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$30" class="0">
<segment>
<pinref part="C2" gate="-2" pin="S"/>
<wire x1="20.32" y1="127" x2="88.9" y2="127" width="0.1524" layer="91"/>
<wire x1="88.9" y1="127" x2="88.9" y2="195.58" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="12"/>
<wire x1="88.9" y1="195.58" x2="111.76" y2="195.58" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$31" class="0">
<segment>
<pinref part="C3" gate="-2" pin="S"/>
<wire x1="20.32" y1="104.14" x2="91.44" y2="104.14" width="0.1524" layer="91"/>
<wire x1="91.44" y1="104.14" x2="91.44" y2="193.04" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="13"/>
<wire x1="91.44" y1="193.04" x2="111.76" y2="193.04" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$32" class="0">
<segment>
<pinref part="C4" gate="-2" pin="S"/>
<wire x1="20.32" y1="83.82" x2="93.98" y2="83.82" width="0.1524" layer="91"/>
<wire x1="93.98" y1="83.82" x2="93.98" y2="190.5" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="14,PWM"/>
<wire x1="93.98" y1="190.5" x2="111.76" y2="190.5" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$33" class="0">
<segment>
<pinref part="C5" gate="-2" pin="S"/>
<wire x1="20.32" y1="60.96" x2="96.52" y2="60.96" width="0.1524" layer="91"/>
<wire x1="96.52" y1="60.96" x2="96.52" y2="187.96" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="15,PWM"/>
<wire x1="96.52" y1="187.96" x2="111.76" y2="187.96" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$34" class="0">
<segment>
<pinref part="C6" gate="-2" pin="S"/>
<wire x1="20.32" y1="38.1" x2="99.06" y2="38.1" width="0.1524" layer="91"/>
<wire x1="99.06" y1="38.1" x2="99.06" y2="185.42" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="16,PWM"/>
<wire x1="99.06" y1="185.42" x2="111.76" y2="185.42" width="0.1524" layer="91"/>
</segment>
</net>
<net name="N$35" class="0">
<segment>
<pinref part="C7" gate="-2" pin="S"/>
<wire x1="20.32" y1="15.24" x2="101.6" y2="15.24" width="0.1524" layer="91"/>
<wire x1="101.6" y1="15.24" x2="101.6" y2="182.88" width="0.1524" layer="91"/>
<pinref part="U$1" gate="G$1" pin="17"/>
<wire x1="101.6" y1="182.88" x2="111.76" y2="182.88" width="0.1524" layer="91"/>
</segment>
</net>
</nets>
</sheet>
</sheets>
</schematic>
</drawing>
</eagle>
